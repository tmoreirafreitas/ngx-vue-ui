<template>
  <div class="d-flex flex-column bd-highlight" :id="dropDownGridId">
    <label class="mr-auto bd-highlight"
      ><strong>{{ label }}</strong></label
    >
    <section class="ui-dropdown-grid">
      <section
        class="combobox d-flex align-items-center justify-content-between"
        @click.self="onToggle()"
      >
        <span
          class="mr-auto text-truncate"
          @click.self="onToggle()"
          v-if="selectedItems.length == 0"
          >{{ selectPlaceholder }}</span
        >
        <div
          class="selected-items d-flex align-items-center justify-content-start"
          v-if="selectedItems.length > 0"
        >
          <span
            class="badge d-flex justify-content-start"
            v-for="(item, index) in selectedItems.slice(
              0,
              maxCountOfLabelsToShow
            )"
            :key="index"
            @click="onClearSelect()"
          >
            <i aria-hidden="true" class="fa fa-times"></i>
            <span class="text-truncate ml-2">{{
              onRender(item.model, displayTextProperty)
            }}</span>
          </span>
          <span v-if="selectedItems.length > maxCountOfLabelsToShow">
            <strong>...</strong>
          </span>
        </div>
        <div class="d-flex align-items-center justify-content-end">
          <button
            type="button"
            class="btn btn-sm btn-clear-selection"
            v-if="selectedItems.length > 0"
            @click="onClearSelect()"
          >
            <i class="fa fa-times"></i>
          </button>
          <section v-html="caretIcon" @click="onToggle()"></section>
        </div>
      </section>

      <transition name="fade">
        <section class="dropdown-options shadow fadeInDown" v-if="toggle">
          <section class="options-container">
            <section class="toolbar d-flex align-items-center">
              <input
                ref="inputSearch"
                type="text"
                class="form-control"
                :placeholder="searchPlaceholder"
                v-model="searchTerm"
                @keyup="onFilter()"
              />
            </section>
            <div class="p-2">
              <Datagrid
                :columns="columns"
                :data="gridData"
                :showActionsColumn="true"
                :itemsPerPage="itemsPerPage"
                :maxPages="maxPages"
                :initialColumnToSort="initialColumnToSort"
                :initialSortDirection="initialSortDirection"
                :actionsColumnWidth="'75px'"
                :actionsColumnCaption="'#'"
                :firstText="firstText"
                :previousText="previousText"
                :nextText="nextText"
                :lastText="lastText"
                :emptyResultsMessage="emptyResultsMessage"
              >
                <template #actions="{ row, rowIndex }">
                  <button
                    class="btn btn-outline-primary btn-sm mr-1"
                    @click="onSelectedItem(row, rowIndex)"
                  >
                    <i aria-hidden="true" class="fas fa-external-link-alt"></i>
                  </button>
                </template>
              </Datagrid>
            </div>
          </section>
        </section>
      </transition>
    </section>
  </div>
</template>
<script>
/* eslint-disable no-unused-vars */
/* eslint-disable */
import {
  defineComponent,
  nextTick,
  onBeforeMount,
  reactive,
  ref,
  toRefs,
  computed,
} from "vue";
import DataGridColumnModel from "@/components/model/DataGridColumnModel";
import Datagrid from "@/components/Datagrid.vue";
import util from "@/utils";
import types from "@/utils/enum";

let _uid = 0;
export default defineComponent({
  name: "InputDropDownGrid",
  components: { Datagrid },
  directives: {},
  props: {
    label: {
      type: String,
      default: "",
    },
    data: {
      type: Array,
      default: [],
    },
    columns: {
      type: Array,
      default: [],
    },
    maxCountOfLabelsToShow: {
      type: Number,
      default: 3,
    },
    initialColumnToSort: {
      type: Number,
      default: 0,
    },
    initialSortDirection: {
      type: String,
      default: types.EnumSortDirection.Ascending,
    },
    totalItems: {
      type: Number,
      default: 10,
    },
    itemsPerPage: {
      type: Number,
      default: 10,
    },
    maxPages: {
      type: Number,
      default: 5,
    },
    displayTextProperty: {
      type: String,
      default: "",
    },
    selectPlaceholder: {
      type: String,
      default: "Select...",
    },
    searchPlaceholder: {
      type: String,
      default: "Search...",
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
    emptyResultsMessage: {
      type: String,
      default: "No results found at this moment.",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["onSelectionChanged", "onRowSelected"],
  setup(props, { emit }) {
    const inputSearch = ref(null);
    const state = reactive({
      selectedItems: [],
      gridData: [],
      dropDownGridId: "",
      searchTerm: "",
      caretIcon: "",
      toggle: false,
    });
    onBeforeMount(() => {
      state.gridData = props.data;
      // generate ID
      _uid++;
      state.dropDownGridId = `drop-down-grid-${_uid}`;
      state.caretIcon = '<i class="fas fa-caret-down"></i>';
    });

    const onClearSelect = () => {
      state.selectedItems = [];
    };
    const onFilter = () => {
      setTimeout(() => {
        state.gridData = util.findInObjArray(props.data, state.searchTerm);
      }, 200);
    };

    const onToggle = () => {
      state.toggle = !state.toggle;
      if (state.toggle) {
        state.caretIcon = '<i class="fas fa-caret-up"></i>';
        setTimeout(() => {
          inputSearch.value.focus();
        }, 100);
      } else {
        state.caretIcon = '<i class="fas fa-caret-down"></i>';
      }
    };

    const onRender = (item, displayTextProperty = "") => {
      return util.findByPath(item, displayTextProperty);
    };

    const onSelectedItem = (item, rowIndex) => {
      state.selectedItems = [];
      const index = state.selectedItems.findIndex(
        (x) => x.rowIndex == rowIndex
      );
      item.selected = true;
      if (index == -1) {
        state.selectedItems.push(item);
      }
      emit("onRowSelected", state.selectedItems);
    };

    return {
      ...toRefs(state),
      onRender,
      onClearSelect,
      onFilter,
      onToggle,
      onSelectedItem,
      inputSearch,
    };
  },
});
</script>
<style lang="scss" scoped>
.ui-dropdown-grid {
  position: relative;
  user-select: none;
  .combobox {
    outline: 0;
    background-color: #fff;
    padding: 0.375rem 0.4rem 0.375rem 0.75rem;
    border: 1px solid #ced4da;
    width: 100%;
    min-width: 300px;
    height: 40px;
    max-height: 50px;
    border-radius: 0.25rem 0.25rem 0 0;

    i {
      color: #495057;
      font-size: 14px;
      margin-left: 10px;
    }
    .selected-items {
      margin-left: -5px;
      overflow: hidden;
      .badge {
        font-size: 0.88em;
        margin-right: 3px;
        line-height: 1;
        color: #888;
        background-color: #e0e0e0;
        border-bottom: 2px solid #ccc;
        border-left: 2px solid #ccc;
        padding: 5px 7px 4px;
        width: 100px;
        height: 30px;
        align-items: center;
      }
      .badge:hover {
        cursor: pointer;
        color: #fff;
        background-color: #007bff;
        border-bottom: 2px solid #00559a;
        border-left: 2px solid #00559a;
      }
    }    

    > .text-truncate {
      word-break: keep-word;
      -moz-text-overflow: ellipsis;
      -ms-text-overflow: ellipsis;
      -o-text-overflow: ellipsis;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      padding: 2px;
    }

    .btn-clear-selection:hover {
      background-color: #e7e7e7;
    }

    > span {
      color: #6c757d;
      font-size: 1rem;
      line-height: 1.5;
    }
  }

  .mr-auto,
  .mx-auto {
    margin-right: auto !important;
  }

  .dropdown-options {
    background-color: #fff;
    border: 1px solid #ced4da;
    border-radius: 0 0 0.25rem 0.25rem;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    z-index: 20;
    margin-top: -1px;
    min-width: 300px;
  }

  .dropdown-options .toolbar {
    padding: 3px;
    border-bottom: 1px solid #ced4da;
    background-color: #f8f9fa;
    input {
      background-color: transparent;
      border: 0;
      padding: 0.375rem 0.55rem;
      box-shadow: none !important;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active em versões anteriores a 2.1.8 */ {
  opacity: 0;
}
</style>