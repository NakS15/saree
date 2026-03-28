/**
 * APIFeatures — chainable helper for filtering, sorting, and pagination.
 * Usage: new APIFeatures(Model.find(), req.query).filter().sort().paginate()
 */
class APIFeatures {
  constructor(query, queryStr) {
    this.query      = query;
    this.queryStr   = queryStr;
    this.filterQuery = {};
  }

  filter() {
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'q'];
    const queryObj = { ...this.queryStr };
    excludedFields.forEach((f) => delete queryObj[f]);

    // Full-text search
    if (this.queryStr.q) {
      this.query = this.query.find({ $text: { $search: this.queryStr.q } });
    }

    // Price range
    if (queryObj.minPrice || queryObj.maxPrice) {
      queryObj.price = {};
      if (queryObj.minPrice) { queryObj.price.$gte = +queryObj.minPrice; delete queryObj.minPrice; }
      if (queryObj.maxPrice) { queryObj.price.$lte = +queryObj.maxPrice; delete queryObj.maxPrice; }
    }

    // Rating filter
    if (queryObj.rating) {
      queryObj.rating = { $gte: +queryObj.rating };
    }

    // Array filters (fabric, occasion, colors)
    ['fabric', 'occasion', 'colors'].forEach((key) => {
      if (queryObj[key]) {
        const vals = Array.isArray(queryObj[key]) ? queryObj[key] : [queryObj[key]];
        if (key === 'fabric') queryObj['attributes.fabric'] = { $in: vals };
        else if (key === 'occasion') queryObj['attributes.occasion'] = { $in: vals };
        else if (key === 'colors') queryObj.colors = { $in: vals };
        delete queryObj[key];
      }
    });

    // Work type
    if (queryObj.workType) {
      queryObj['attributes.workType'] = queryObj.workType;
      delete queryObj.workType;
    }

    // Blouse included
    if (queryObj.blouseIncluded === 'true') {
      queryObj['attributes.blousePieceIncluded'] = true;
      delete queryObj.blouseIncluded;
    }

    // Boolean flags (isFeatured, isTrending)
    ['isFeatured', 'isTrending'].forEach((flag) => {
      if (queryObj[flag]) {
        queryObj[flag] = queryObj[flag] === 'true';
      }
    });

    // MongoDB operators ($gt, $gte, etc.)
    let str = JSON.stringify(queryObj);
    str = str.replace(/\b(gt|gte|lt|lte|in|nin)\b/g, (m) => `$${m}`);
    const parsed = JSON.parse(str);

    this.filterQuery = parsed;
    this.query = this.query.find(parsed);
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate() {
    const page  = Math.max(parseInt(this.queryStr.page)  || 1, 1);
    const limit = Math.min(parseInt(this.queryStr.limit) || 12, 100);
    const skip  = (page - 1) * limit;
    this.query  = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
