class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString }; // HARD COPY
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // ADVANCED FILTERING
    // A : BY VALUES
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); //ADDS $ TO FILTER OBJECTS OF MONGO
    const filteredQuery = JSON.parse(queryStr);

    // EXECUTE QUERY
    this.query.find(filteredQuery);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' '); // TO MATCH MONGOOSE SYNTAX
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('createdAt _id');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // EXCLUDING MONGODB'S INTERNAL FIELD
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1; // CONVERT TO INT
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit; // FORMULA : PREVIOUS PAGE MULTIPLIED BY LIMIT
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
