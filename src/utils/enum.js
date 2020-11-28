class EnumSortDirection {
  static get Ascending() {
    return "asc";
  }
  static get Descending() {
    return "desc";
  }
  static get None() {
    return "none";
  }
}

class EnumAlignment {
  static get Left() {
    return 0;
  }
  static get Center() {
    return 1;
  }
  static get Right() {
    return 2;
  }
}

const types = {
  EnumAlignment,
  EnumSortDirection
};

export default types;
