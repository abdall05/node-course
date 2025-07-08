class APIFeatures {
  constructor(mongooseQuery, queryString) {
    (this.mongooseQuery = mongooseQuery), (this.queryString = queryString);
  }
  filter() {
    let queryObj = { ...this.queryString };
    const excludedField = ['page', 'sort', 'limit', 'fields'];
    excludedField.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    //Adapting the query format to mongoDB; eg: gt =>$gt ...
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    queryObj = JSON.parse(queryStr);

    //Building the query
    this.mongooseQuery.find(queryObj);
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.mongooseQuery.sort(sortBy);
    }
    return this;
  }
  limit() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery.select('-__v');
    }
    return this;
  }
  async paginate() {
    const DEFAULT_PAGE = 1;
    const DEFAULT_LIMIT = 100;
    const page = +this.queryString.page || DEFAULT_PAGE;
    const limit = +this.queryString.limit || DEFAULT_LIMIT;
    const skip = (page - 1) * limit;
    const numDocuments = await this.mongooseQuery.model.countDocuments(
      this.mongooseQuery.getQuery()
    );
    if (skip >= numDocuments) throw new Error('This page does not exist');
    this.mongooseQuery.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIFeatures;
