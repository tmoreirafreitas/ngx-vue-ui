import types from "@/utils/enum";
/* eslint-disable no-unused-vars */
export default class DataGridColumnModel {
  caption = "";
  captionAlignment = types.EnumAlignment.Left; //EnumAlignment.Left;
  captionClasses = "";
  data = "";
  dataAlignment = types.EnumAlignment.Left;
  dataClasses = "";
  width = "";
  icon = '<i class="fas fa-sort" aria-hidden="true"></i>';
  index = -1;
  visible = true;
  filterable = true;
  sortable = true;
  sortDirection = types.EnumSortDirection.Ascending;
  searchQuery = "";
  valueSelected = "";
  popoverShow = false;
  valuesFiltered = [];
  valuesToFilter = [];

  constructor(
    caption = "",
    data = "",
    filterable = true,
    sortable = true,
    visible = true,
    renderCallback,
    width = "",
    sortDirection = types.EnumSortDirection.Ascending
  ) {
    this.caption = caption;
    this.data = data;
    this.filterable = filterable;
    this.sortable = sortable;
    this.visible = visible;
    this.render = renderCallback;
    this.width = width;
    this.sortDirection = sortDirection;
  }
}
