<template>
  <section class="ui-vue-datagrid d-flex flex-column bd-highlight">
    <table
      class="table table-bordered table-hover table-animated table-fixed table-not-resizing"
      :id="identifier"
    >
      <thead>
        <tr :id="identifier + '_header'">
          <th
            class="text-center checkbox-column"
            v-if="showCheckboxColumn && gridData.hasData"
            style="width: 50px; vertical-align: middle !important"
          >
            <input
              type="checkbox"
              v-model="selectedAll"
              v-if="showSelectAllCheckbox"
              @change="onSelectAllChanged()"
            />
          </th>
          <th
            v-if="showActionsColumn"
            class="th-sm action"
            :style="externalActionsColumnWidth"
          >
            <section class="d-flex bd-highlight">
              <header class="text-center flex-grow-1 my-2">
                {{ actionsColumnCaption }}
              </header>
            </section>
          </th>
          <th
            v-for="(column, index) in internalColumns"
            :key="index"
            :class="
              'th-sm' +
                ((column.sortable || column.filterable) &&
                gridData.rows.length > 0
                  ? ' header'
                  : '')
            "
            @mouseover="hover = true"
            @mouseleave="hover = false"
            @click.self="
              column.sortable && gridData.rows.length > 0 ? onSort(index) : null
            "
          >
            <section class="wrapper">
              <header
                class="box-actions"
                :key="index"
                @click.self="
                  column.sortable && gridData.rows.length > 0
                    ? onSort(index)
                    : null
                "
                :id="'table-' + identifier + '_column-' + index"
              >
                <section
                  class="ml-3 my-2"
                  @click.self="
                    column.sortable && gridData.rows.length > 0
                      ? onSort(index)
                      : null
                  "
                >
                  {{ column.caption }}
                </section>
                <section class="d-flex justify-content-end mr-3">
                  <button
                    class="btn btn-sm ml-1 mr-1 my-1"
                    v-if="column.sortable && gridData.rows.length > 0"
                    :ref="'btn-sort-' + index"
                    v-html="column.icon"
                    @click="
                      column.sortable && gridData.rows.length > 0
                        ? onSort(index)
                        : null
                    "
                  ></button>
                  <button
                    :id="'btn_popover_' + index + '_' + identifier"
                    :name="'btn_popover_' + index + '_' + identifier"
                    :class="
                      'btn btn-sm btn-filter ' +
                        (hover && !column.valueSelected
                          ? ' not-filterad '
                          : '') +
                        (column.valueSelected ? ' btn-primary' : '')
                    "
                    v-if="column.filterable"
                    data-container="body"
                    data-toggle="popover"
                    data-html="true"
                    :to-popover="'datagrid_popover_' + index"
                    :ref="
                      el => {
                        buttonsReferences[index] = el;
                      }
                    "
                    @click="closeEvent(index)"
                  >
                    <i class="fa fa-filter" aria-hidden="true"></i>
                  </button>
                  <Popover
                    :name="'datagrid_popover_' + column.index"
                    :trigger="'click'"
                    placement="bottom"
                    v-if="column.filterable"
                    v-clickOutside="closeEvent"
                  >
                    <!-- v-click-outside="closeEvent" -->
                    <section class="box-filter">
                      <main class="search">
                        <section class="wrapper">
                          <header class="form-group has-search">
                            <span
                              class="fa fa-search form-control-feedback"
                            ></span>
                            <input
                              :id="'datagrid_popover_input_' + column.index"
                              type="text"
                              class="form-control"
                              placeholder="Search"
                              v-model="column.searchQuery"
                              @keyup="
                                onFilteredHeader(
                                  $event,
                                  index,
                                  column.valuesToFilter
                                )
                              "
                              @keyup.delete="
                                onFilteredHeader(
                                  $event,
                                  index,
                                  column.valuesToFilter
                                )
                              "
                            />
                          </header>
                        </section>

                        <section
                          class="valueSelectedToFilter"
                          v-if="column.valueSelected !== ''"
                        >
                          <button
                            :id="
                              'btn_valueSelectedToFilter' +
                                column.index +
                                '_' +
                                identifier
                            "
                            type="button"
                            class="btn btn-primary btn-sm"
                            @click="onClearValueSelected(index)"
                          >
                            <i aria-hidden="true" class="fa fa-times"></i>
                            &nbsp;&nbsp; {{ column.valueSelected }}
                          </button>
                        </section>

                        <ul>
                          <li
                            class="text-truncate"
                            v-for="(value,
                            indexDpdItem) in column.valuesFiltered"
                            :key="indexDpdItem"
                            @click="onSelectedValue(index, value)"
                          >
                            {{ value }}
                          </li>
                        </ul>
                      </main>
                    </section>
                  </Popover>
                </section>
              </header>
            </section>
            <section class="resizer"></section>
          </th>
        </tr>
      </thead>
      <tbody :id="'table-' + identifier + '_data'" v-if="gridData.rows.length > 0">
        <tr
          v-for="(row, indexRow) in paginator.data"
          :key="'table-' + identifier + '_key-' + indexRow"
          :data-index="'table-' + identifier + '_data-index-' + indexRow"
        >
          <td
            class="text-center checkbox-column"
            v-if="showCheckboxColumn && gridData.hasData"
          >
            <input
              type="checkbox"
              v-model="row.selected"
              :disabled="row.disabled"
              @change="onRowSelectedChanged(row, indexRow)"
            />
          </td>
          <td v-if="showActionsColumn" class="tdcontent">
            <section class="d-flex justify-content-center">
              <slot name="actions" :row="row" :rowIndex="row.rowIndex"></slot>
            </section>
          </td>
          <td
            class="vertical-center"
            v-for="(column, indexColumn) in internalColumns"
            :key="indexRow - indexColumn"
            v-html="
              typeof column.render === 'function'
                ? column.render(row, renderValue(row, column.data), indexRow)
                : column.data &&
                  column.data !== null &&
                  column.data !== undefined
                ? renderValue(row, column.data)
                : row[column.name.toLowerCase()]
            "
          ></td>
        </tr>
      </tbody>
      <tbody
        :id="identifier + '_tbody_'"
        v-if="!gridData.rows.length || gridData.rows.length <= 0"
      >
        <tr>
          <td
            class="vertical-center"
            :colspan="
              showActionsColumn
                ? internalColumns.length + 1
                : internalColumns.length
            "
          >
            <p class="mb-0 d-flex flex-fill justify-content-center">
              {{ emptyResultsMessage }}
            </p>
          </td>
        </tr>
      </tbody>
    </table>
    <section
      class="pagination-box"
      v-if="gridData.rows.length > 0 && showPagination"
    >
      <section class="custom-pagination-info">
        <label>{{ getInfo() }}</label>
      </section>
      <section class="custom-pagination">
        <Pagination
          :totalItems="rowsFiltered.length"
          :pageSize="itemsPerPage"
          :labels="labelPagination"
          :maxPages="maxPages"
          @onPaginate="handlePaginate($event)"
        />
      </section>
    </section>
  </section>
</template>

<script>
/* eslint-disable no-unused-vars */
/* eslint-disable */
import "@/assets/ui-vue-datagrid.scss";
import util from "@/utils";
import types from "@/utils/enum";
import DataGridColumnModel from "@/components/model/DataGridColumnModel";
import Popover from "@/components/Popover.vue";
import Pagination from "@/components/Pagination.vue";
import eventBus from "@/utils/eventbus.js";
import clickOutside from "@/diretives/click-outside";
import {
  ref,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  onBeforeUpdate,
  computed,
  reactive,
  toRefs,
  defineComponent,
  watch,
} from "vue";

let _uid = 0;
export default defineComponent({
  name: "Datagrid",
  components: {
    Popover,
    Pagination,
  },
  directives: {
    clickOutside,
  },
  props: {
    columns: {
      type: Array,
      required: true,
      validator: function (value) {
        let validado = false;
        if (!value || value.length == 0) {
          console.error("Param [columns] cannot be undefined or empty.");
        } else {
          validado = true;
        }
        return validado;
      },
    },
    data: {
      type: Array,
      required: false,
      default: () => {
        return [];
      },
    },
    initialColumnToSort: {
      type: Number,
      default: 0,
    },
    initialSortDirection: {
      type: String,
      default: types.EnumSortDirection.Ascending,
    },
    itemsPerPage: {
      type: Number,
      default: 10,
    },
    maxPages: {
      type: Number,
      default: 5,
    },
    actionsColumnCaption: {
      type: String,
      default: "#",
    },
    actionsColumnWidth: {
      type: String,
      default: "100px",
    },
    firstText: {
      type: String,
      default: "First",
    },
    previousText: {
      type: String,
      default: "Prev",
    },
    nextText: {
      type: String,
      default: "Next",
    },
    lastText: {
      type: String,
      default: "Last",
    },
    showPagination: {
      type: Boolean,
      default: true,
    },
    showActionsColumn: {
      type: Boolean,
      default: false,
    },
    showSelectAllCheckbox: {
      type: Boolean,
      default: false,
    },
    showCheckboxColumn: {
      type: Boolean,
      default: false,
    },
    emptyResultsMessage: {
      type: String,
      default: "No results found at this moment.",
    },
  },
  emits: ["onSelectionChanged", "onRowSelected", "onPaginate", "onSort"],
  setup(props, { emit }) {
    const { firstText, previousText, nextText, lastText } = props;

    const state = reactive({
      paginator: {},
      gridData: {
        hasData: props.data && props.data.length > 0,
        rows: [],
      },
      infoMessage:
        "Showing records from {recordsFrom} to {recordsTo} of {totalRecords} records found.",
      internalColumns: [],
      externalInitialColumnToSort: 0,
      externalInitialSortDirection: types.EnumSortDirection,
      externalActionsColumnWidth: "",
      identifier: "",
      rowsFiltered: [],
      hover: false,
      selectedAll: false,
      buttonsReferences: [],
      lastButtonClicked: "",
      labelPagination: {
        first: firstText,
        last: lastText,
        previous: previousText,
        next: nextText,
      },
    });

    onBeforeMount(() => {
      initializeData();
      initializeColumns();
      state.externalActionsColumnWidth = `width:${
        props.actionsColumnWidth ?? "100px"
      }`;
      // generate ID
      _uid++;
      state.paginator.identifier = _uid;
      state.identifier = `datagrid-${_uid}`;
    });

    onBeforeUnmount(() => {
      delete state.rowsFiltered;
      delete state.gridData;
      delete state.internalColumns;
      delete state.paginator;
    });

    onMounted(() => {
      applyResizableGrid();
    });

    watch(
      () => props.data,
      (newVal) => {
        initializeData(newVal);
      }
    );

    function initializeData(items) {
      state.gridData.rows = [];
      const tmpData = items || props.data;
      tmpData.map((item, index) => {
        state.gridData.rows.push({
          rowIndex: index,
          selected: false,
          disabled: item.hasOwnProperty("disabled") ? item["disabled"] : false,
          model: item,
        });
      });
      state.rowsFiltered = state.gridData.rows;
    }

    function initializeColumns() {
      if (!state.internalColumns)
        state.internalColumns = Object.assign([], props.columns);

      state.internalColumns = [];
      for (let i = 0; i < props.columns.length; i++) {
        const target = new DataGridColumnModel(
          props.columns[i].caption,
          props.columns[i].data ? `model.${props.columns[i].data}` : "",
          typeof props.columns[i].filterable !== "undefined"
            ? props.columns[i].filterable
            : true,
          typeof props.columns[i].sortable !== "undefined"
            ? props.columns[i].sortable
            : true,
          typeof props.columns[i].visible !== "undefined"
            ? props.columns[i].visible
            : true,
          props.columns[i].render,
          props.columns[i].width ?? "",
          props.columns[i].sortDirection ?? types.EnumSortDirection.None
        );
        target.captionAlignment =
          props.columns[i].captionAlignment ?? types.EnumAlignment.Left;
        target.captionClasses = props.columns[i].captionClasses ?? "";
        target.dataAlignment =
          props.columns[i].dataAlignment ?? types.EnumAlignment.Left;
        target.dataClasses = props.columns[i].dataClasses ?? "";
        target.index = i;

        target.searchQuery = "";
        target.valueSelected = "";
        target.popoverShow = false;
        target.valuesFiltered = [];
        target.valuesToFilter = [];

        if (state.gridData.rows && state.gridData.rows.length > 0) {
          if (target.filterable) {
            target.valuesToFilter = Object.keys(
              util.groupBy(state.gridData.rows, target.data ?? "")
            )
              .map((item) => util.capitalize(item))
              .sort();
            target.valuesFiltered = target.valuesToFilter ?? [];
          }
        }
        state.internalColumns.push(target);
      }
    }

    function onFilteredHeader(event, index, list) {
      let filter = [];
      if (state.internalColumns) {
        const key = event.keyCode || event.charCode;
        if (event.key.toLowerCase() == "delete" || key == 8 || key == 46) {
          filter = list;
        } else {
          if (state.internalColumns[index].searchQuery) {
            const search = state.internalColumns[index].searchQuery ?? "";
            filter = util.findInObjArray(list, search);
          } else {
            filter = list;
          }
        }
        state.internalColumns[index].valuesFiltered = filter;
      }
    }

    function internalPaginate() {
      const paginatorConfig = {
        items: state.rowsFiltered,
        currentPage: 1,
        pageSize: props.itemsPerPage,
        maxPages: props.maxPages,
      };
      const { items, pageSize, maxPage } = paginatorConfig;
      state.paginator = util.paginate(items, 1, pageSize, maxPage);
      if (!props.showPagination) {
        state.paginator.data = state.rowsFiltered;
      }
    }

    function handlePaginate(pagination) {
      state.paginator = util.paginate(
        state.rowsFiltered,
        pagination.currentPage,
        pagination.pageSize,
        pagination.maxPage
      );
      emit("onPaginate", pagination);
    }

    function onSort(index) {
      if (state.internalColumns) {
        if (
          state.internalColumns[index].sortDirection ===
          types.EnumSortDirection.None
        ) {
          state.internalColumns[index].sortDirection =
            types.EnumSortDirection.Ascending;
          state.internalColumns[
            index
          ].icon = `<i class="fas fa-sort-amount-down-alt" aria-hidden="true"></i>`;
        } else if (
          state.internalColumns[index].sortDirection ===
          types.EnumSortDirection.Ascending
        ) {
          state.internalColumns[index].sortDirection =
            types.EnumSortDirection.Descending;
          state.internalColumns[
            index
          ].icon = `<i class="fas fa-sort-amount-down" aria-hidden="true"></i>`;
        } else {
          state.internalColumns[index].sortDirection =
            types.EnumSortDirection.Ascending;
          state.internalColumns[
            index
          ].icon = `<i class="fas fa-sort-amount-down-alt" aria-hidden="true"></i>`;
        }

        const paramOrder = {
          key: state.internalColumns[index].data,
          order: state.internalColumns[index].sortDirection,
          rows: state.rowsFiltered,
        };
        util.sortElementsBy(paramOrder);
        internalPaginate();

        for (let i = 0; i < state.internalColumns.length; i++) {
          if (i !== index) {
            state.internalColumns[
              i
            ].icon = `<i class="fas fa-sort" aria-hidden="true"></i>`;
          }
        }

        emit("onSort", state.internalColumns[index]);
      }
    }

    function onSelectedValue(index, value) {
      if (state.internalColumns) {
        state.internalColumns[index].valueSelected = value;
        onFilteredTable();
      }
    }

    function onClearValueSelected(index) {
      if (state.internalColumns) {
        state.internalColumns[index].valueSelected = "";
        onFilteredTable();
      }
    }

    function onFilteredTable() {
      let tmp = state.gridData.rows;
      let filter = [];

      if (state.internalColumns) {
        state.internalColumns.forEach((col) => {
          if (col.valueSelected && col.valueSelected !== "") {
            filter = tmp.filter((item, index) => {
              const val = util.findByPath(item, col.data);
              return typeof val === "string"
                ? val.toLowerCase().startsWith(col.valueSelected.toLowerCase())
                : typeof val == "number"
                ? Number(val) === Number(col.valueSelected)
                : val.toLowerCase();
            });
          } else {
            filter = tmp;
          }
          tmp = filter;
        });
        state.rowsFiltered = tmp;
      }

      internalPaginate();
    }

    function onRowSelectedChanged(row, indexRow) {
      emit("onRowSelected", row);
    }

    function onSelectAllChanged() {
      const tmpData = state.paginator.data;
      if (!state.gridData || !state.gridData.hasData) {
        return;
      }

      tmpData.map((item) => {
        item.selected = state.selectedAll;
      });

      emit("onSelectionChanged", tmpData);
    }

    function renderValue(item, path) {
      return util.findByPath(item, path);
    }

    function getInfo() {
      if (state.paginator && state.paginator.data)
        return (
          state.infoMessage
            ?.replace("{recordsFrom}", state.paginator.startIndex.toString())
            .replace("{recordsTo}", state.paginator.endIndex.toString())
            .replace("{totalRecords}", state.paginator.totalItems.toString()) ??
          ""
        );
      return "";
    }

    function applyResizableGrid() {
      var table = document.getElementById(state.identifier);
      if (table) resizableGrid(table);
    }

    function resizableGrid(table) {
      var row = table.getElementsByTagName("tr")[0],
        cols = row ? row.children : undefined;
      if (!cols) return;

      var tableHeight = table.offsetHeight;
      let resizers = table.getElementsByClassName("resizer");
      for (let i = 0; i < resizers.length; i++) {
        setListeners(resizers[i]);
      }

      function setListeners(section) {
        var pageX, curCol, nxtCol, curColWidth, nxtColWidth;

        section.addEventListener("mousedown", function (e) {
          curCol = e.target.parentElement;
          nxtCol = curCol.nextElementSibling;
          pageX = e.pageX;

          var padding = paddingDiff(curCol);

          curColWidth = curCol.offsetWidth - padding;
          if (nxtCol) nxtColWidth = nxtCol.offsetWidth - padding;
        });

        document.addEventListener("mousemove", function (e) {
          if (curCol) {
            var diffX = e.pageX - pageX;
            if (nxtCol) nxtCol.style.width = nxtColWidth - diffX + "px";
            curCol.style.width = curColWidth + diffX + "px";
          }
        });

        document.addEventListener("mouseup", function (e) {
          curCol = undefined;
          nxtCol = undefined;
          pageX = undefined;
          nxtColWidth = undefined;
          curColWidth = undefined;
        });
      }

      function createsection(height) {
        var section = document.createElement("section");
        section.style.top = 0;
        section.style.right = 0;
        section.style.width = "6px";
        section.style.position = "absolute";
        section.style.cursor = "col-resize";
        section.style.userSelect = "none";
        section.style.height = "100%"; //height + "px";
        section.style.background =
          "background: repeating-linear-gradient(45deg,transparent,transparent 2px,rgba(0,0,0,.2) 2px,rgba(0,0,0,.2) 4px);";
        return section;
      }

      function paddingDiff(col) {
        if (getStyleVal(col, "box-sizing") == "border-box") {
          return 0;
        }

        var padLeft = getStyleVal(col, "padding-left");
        var padRight = getStyleVal(col, "padding-right");
        return parseInt(padLeft) + parseInt(padRight);
      }

      function getStyleVal(elm, css) {
        return window.getComputedStyle(elm, null).getPropertyValue(css);
      }
    }

    function closeEvent(index) {
      if (!state.lastButtonClicked) {
        state.lastButtonClicked = state.buttonsReferences[
          index
        ].attributes?.getNamedItem("to-popover")?.value;
      } else {
        if (event.target instanceof Element) {
          let hasBtn =
            event.target?.attributes?.getNamedItem("to-popover")?.value ==
            state.lastButtonClicked;
          if (typeof index === "number") {
            state.lastButtonClicked = state.buttonsReferences[
              index
            ].attributes?.getNamedItem("to-popover")?.value;
          } else {
            hasBtn =
              event.target?.attributes
                ?.getNamedItem("id")
                ?.value.indexOf("btn") === undefined
                ? false
                : event.target?.attributes
                    ?.getNamedItem("id")
                    ?.value.indexOf("btn") !== -1;
          }

          if (!hasBtn) {
            eventBus().emit("close-popover");
          }
        }
      }
    }

    return {
      applyResizableGrid,
      getInfo,
      onFilteredHeader,
      onSort,
      onSelectedValue,
      onClearValueSelected,
      onFilteredTable,
      onSelectAllChanged,
      onRowSelectedChanged,
      renderValue,
      closeEvent,
      handlePaginate,
      ...toRefs(state),
    };
  },
});
</script>
