<template>
  <section
    class="ui-vue-pagination"
    v-if="paginator && paginator.pages && paginator.totalPages > 0"
  >
    <ul class="pagination" :style="ulStyles">
      <li
        class="page-item first"
        :class="{ disabled: paginator.currentPage === 1 }"
        :style="liStyles"
      >
        <a class="page-link" @click="setPage(1)" :style="aStyles">{{
          labels.first
        }}</a>
      </li>
      <li
        class="page-item previous"
        :class="{ disabled: paginator.currentPage === 1 }"
        :style="liStyles"
      >
        <a
          class="page-link"
          @click="setPage(paginator.currentPage - 1)"
          :style="aStyles"
          >{{ labels.previous }}</a
        >
      </li>
      <li
        v-for="page in paginator.pages"
        :key="page"
        class="page-item page-number"
        :class="{ active: paginator.currentPage === page }"
        :style="liStyles"
      >
        <a class="page-link" @click="setPage(page)" :style="aStyles">{{
          page
        }}</a>
      </li>
      <li
        class="page-item next"
        :class="{ disabled: paginator.currentPage === paginator.endPage }"
        :style="liStyles"
      >
        <a
          class="page-link"
          @click="setPage(paginator.currentPage + 1)"
          :style="aStyles"
          >{{ labels.next }}</a
        >
      </li>
      <li
        class="page-item last"
        :class="{ disabled: paginator.currentPage === paginator.endPage }"
        :style="liStyles"
      >
        <a
          class="page-link"
          @click="setPage(paginator.totalPages)"
          :style="aStyles"
          >{{ labels.last }}</a
        >
      </li>
    </ul>
  </section>
</template>
<script>
/* eslint-disable no-unused-vars */
/* eslint-disable vue/no-setup-props-destructure */
/* eslint-disable */
import "@/assets/ui-vue-pagination.scss";
import util from "../utils";
import { defineComponent, ref, computed, onBeforeMount, onMounted, watchEffect, onBeforeUpdate, watch } from "vue";

const defaultLabels = {
  first: "First",
  last: "Last",
  previous: "Previous",
  next: "Next",
};

const defaultStyles = {
  ul: {
    margin: 0,
    padding: 0,
    display: "inline-block",
  },
  li: {
    listStyle: "none",
    display: "inline",
    textAlign: "center",
  },
  a: {
    cursor: "pointer",
    padding: "6px 12px",
    display: "block",
    float: "left",
  },
};

export default defineComponent({
  name: "Pagination",
  props: {
    totalItems: {
      type: Number,
      required: true,
    },
    initialPage: {
      type: Number,
      default: 1,
    },
    pageSize: {
      type: Number,
      default: 10,
    },
    maxPages: {
      type: Number,
      default: 5,
    },
    labels: {
      type: Object,
      default: () => defaultLabels,
    },
    styles: {
      type: Object,
    },
    disableDefaultStyles: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["onPaginate"],
  setup(props, { emit }) {
    const paginator = ref({});
    const ulStyles = ref({});
    const liStyles = ref({});
    const aStyles = ref({});
    const {
      totalItems,
      initialPage,
      pageSize,
      maxPages,
      labels,
      styles,
      disableDefaultStyles,
    } = props;

    onBeforeMount(() => {
      // set default styles unless disabled
      if (!disableDefaultStyles) {
        ulStyles.value = defaultStyles.ul;
        liStyles.value = defaultStyles.li;
        aStyles.value = defaultStyles.a;
      }

      // merge custom styles with default styles
      if (styles) {
        ulStyles.value = { ...ulStyles.value, ...styles.ul };
        liStyles.value = { ...liStyles.value, ...styles.li };
        aStyles.value = { ...aStyles.value, ...styles.a };
      }

      // set page if items array isn't empty
      setPage(initialPage);
    });

    watch(() => props.totalItems, (newVal) => {
       setPage(1);
    });

    const setPage = (page) => {
      const { totalItems, pageSize, maxPages } = props;
      paginator.value = util.logicPaginate(
        totalItems,
        page || 1,
        pageSize,
        maxPages
      );
      emit("onPaginate", paginator.value);
    };
    return {
      paginator,
      setPage,
      ulStyles,
      liStyles,
      aStyles,
    };
  },
});
</script>
