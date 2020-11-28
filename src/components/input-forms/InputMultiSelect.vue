<template>
  <article class="d-flex flex-column bd-highlight" :id="identifier">
    <label class="mr-auto bd-highlight"
      ><strong>{{ label }}</strong></label
    >
    <section class="ui-vue-input-multi-select">
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
            @click="onRemoveItemSelected(index)"
          >
            <i aria-hidden="true" class="fa fa-times"></i>
            <span class="text-truncate ml-2">{{
              onRender(item.data, displayTextProperty)
            }}</span>
          </span>
          <span v-if="selectedItems.length > maxCountOfLabelsToShow">
            <strong>...</strong>
          </span>
        </div>

        <section v-html="caretIcon" @click="onToggle()"></section>
      </section>
      <transition name="fade">
        <section class="dropdown-options shadow fadeInDown" v-if="toggle">
          <section class="options-container">
            <section class="toolbar d-flex align-items-center">
              <input
                :id="inputSearchId"
                ref="inputSearch"
                type="text"
                class="form-control flex-grow-1"
                :placeholder="searchPlaceholder"
                v-model="searchTerm"
                @keyup="onFilter()"
              />
              <button
                class="btn btn-light ml-1 flex-shrink-0"
                type="button"
                @click.stop="onSelectAllChanged()"
              >
                <i class="fa fa-check-square"></i> Select all
              </button>
              <button
                class="btn btn-light ml-1 flex-shrink-0"
                type="button"
                @click.stop="onClearSelect()"
              >
                <i class="fa fa-eraser"></i> Clear selection
              </button>
            </section>
            <InfiniteScrollComponent
              :tag="'ul'"
              :totalItems="options.length"
              :pageSize="50"
              @onScroll="onLoadMore($event)"
            >
              <li
                class="d-flex"
                v-for="(item, index) of filteredData"
                :key="index"
              >
                <div class="checkbox mr-3 flex-shrink-0">
                  <input
                    type="checkbox"
                    v-model="item.selected"
                    @change="onRowSelectedChanged()"
                  />
                </div>
                <span class="link">{{
                  onRender(item.data, displayTextProperty)
                }}</span>
              </li>
            </InfiniteScrollComponent>
          </section>
        </section>
      </transition>
    </section>
  </article>
</template>

<script>
/* eslint-disable no-unused-vars */
/* eslint-disable */
import {
  defineComponent,
  ref,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  computed,
  toRefs,
  reactive,
} from "vue";
import InfiniteScrollComponent from "@/components/InfiniteScrollComponent.vue";
import util from "@/utils";

let _uid = 0;

export default defineComponent({
  nome: "InputMultiSelect",
  components: {
    InfiniteScrollComponent,
  },
  directives: {},
  props: {
    label: {
      type: String,
      required: false,
      default: "",
    },
    maxCountOfLabelsToShow: {
      type: Number,
      default: 3,
    },
    selectPlaceholder: {
      type: String,
      required: false,
      default: "Select...",
    },
    searchPlaceholder: {
      type: String,
      required: false,
      default: "Search...",
    },
    displayTextProperty: {
      type: String,
      required: false,
      default: "",
    },
    valueProperty: {
      type: String,
      required: false,
      default: "",
    },
    selectAllButtonLabel: {
      type: String,
      required: false,
      default: "",
    },
    clearSelectionButtonLabel: {
      type: String,
      required: false,
      default: "",
    },

    options: {
      type: Array,
      required: true,
      validator: function (value) {
        let isValid = false;
        if (!value || value.length == 0) {
          console.error(
            "Param [options] cannot be undefined or null or empty."
          );
        } else {
          isValid = true;
        }
        return isValid;
      },
    },
  },
  emits: ["onSelectionChanged", "onRowSelected"],
  setup(props, { emit }) {
    const refInputMultiSelectList = ref(null);
    const pageSize = 25;
    const inputSearch = ref(null);
    const state = reactive({
      selectedItems: [],
      searchTerm: "",
      identifier: "",
      inputSearchId: "",
      listId: "",
      caretIcon: '<i class="fas fa-caret-down"></i>',
      filteredData: [],
      internalOptions: [],
      paginator: {},
      toggle: false,
      inputSearch: null,
    });

    const initialize = () => {
      if (props.options) {
        props.options.map((item, index) => {
          state.internalOptions.push({
            selected: false,
            index: index,
            data: item,
          });
        });
      }

      // generate ID
      _uid++;
      state.identifier = `input-multi-select-${_uid}`;
      state.inputSearchId = `input-multi-select-search-${_uid}`;
      state.listId = `input-multi-select-list-${_uid}`;
    };

    const onRender = (item = any, displayTextProperty = "") => {
      return util.findByPath(item, displayTextProperty);
    };

    const onFilter = () => {
      setTimeout(() => {
        if (state.searchTerm && state.searchTerm.length > 0) {
          const filteredList = util.findInObjArray(
            state.internalOptions,
            state.searchTerm
          );
          state.filteredData = [];
          const filterPaginator = util.paginate(
            filteredList,
            1,
            pageSize,
            state.internalOptions.length / pageSize
          );
          state.filteredData = filterPaginator.data;
        }
      }, 300);
    };

    const onToggle = () => {
      state.toggle = !state.toggle;
      if (state.toggle) {
        state.caretIcon = '<i class="fas fa-caret-up"></i>';
        setTimeout(() => {
          inputSearch.value.focus();
        }, 100);
      } else {
        state.filteredData = [];
        state.caretIcon = '<i class="fas fa-caret-down"></i>';
      }
    };

    const onRowSelectedChanged = () => {
      state.selectedItems = state.filteredData.filter(
        (item) => item.selected == true
      );
      emit("onRowSelected", state.selectedItems);
    };

    const onSelectAllChanged = () => {
      state.filteredData.map((x) => (x.selected = true));
      state.selectedItems = state.filteredData.filter(
        (x) => x.selected == true
      );
      emit("onSelectionChanged", state.filteredData);
    };

    const onClearSelect = () => {
      if (state.toggle) {
        state.filteredData.map((item) => (item.selected = false));
        state.searchTerm = "";
      }
      state.selectedItems = state.filteredData.filter(
        (x) => x.selected == true
      );
      emit("onSelectionChanged", []);
    };

    const onRemoveItemSelected = (index) => {
      if (state.toggle) {
        const obj = state.filteredData.find((x) => x.index == x.index);
        obj.selected = false;
      }
      state.selectedItems[index].selected = false;
      state.selectedItems.splice(index, 1);
    };

    onBeforeMount(() => {
      initialize();
    });

    const onLoadMore = (event) => {
      if (state.toggle) {
        state.paginator = util.paginate(
          state.internalOptions,
          event.currentPage,
          event.pageSize,
          state.internalOptions.length / event.pageSize
        );
        state.filteredData.push(...state.paginator.data);
      }
    };

    return {
      ...toRefs(state),
      inputSearch,
      onRender,
      onFilter,
      onToggle,
      onRowSelectedChanged,
      onSelectAllChanged,
      onClearSelect,
      onRemoveItemSelected,
      onLoadMore,
      refInputMultiSelectList,
    };
  },
});
</script>

<style lang="scss" scoped>
.ui-vue-input-multi-select {
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
    i {
      color: #495057;
      font-size: 14px;
      margin-left: 10px;
    }
    .selected-items {
      margin-left: -5px;
      overflow: hidden;
      // margin-top: 5px;
      // margin-bottom: 5px;
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
    .open {
      border-radius: 0.25rem 0.25rem 0 0;
    }
    .text-truncate {
      word-break: keep-word;
      -moz-text-overflow: ellipsis;
      -ms-text-overflow: ellipsis;
      -o-text-overflow: ellipsis;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      padding: 2px;
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

  > .dropdown-options {
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
    .options-container {
      .toolbar {
        .btn-light:hover {
          background-color: rgb(220, 229, 250);
        }
      }
    }
    ul,
    InfiniteScrollComponent {
      max-height: 300px;
      overflow-y: scroll;
      overflow-x: hidden;
      margin: 0;
      padding: 0;
      li {
        list-style: none;
        border-bottom: 1px solid #ced4da;
        > span {
          cursor: pointer;
          padding: 8px 0;
        }
        .checkbox {
          background-color: #f0f0f0;
          border-right: 1px solid #ced4da;
          padding: 12px 15px;
          display: flex;
          align-items: center;
        }
        [type="checkbox"] {
          width: 17px;
          height: 17px;
        }
      }
      li:last-child {
        border-bottom: 0;
      }
    }
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
