<template>
  <component :is="tag" ref="refComponent" :id="customComponentId">
    <slot />
  </component>
</template>
<script>
/* eslint-disable no-unused-vars */
/* eslint-disable */
import {
  defineComponent,
  onMounted,
  reactive,
  toRefs,
  ref,
  onBeforeMount,
} from "vue";
import util from "@/utils";
let _uid = 0;
export default defineComponent({
  name: "InfiniteScrollComponent",
  props: {
    tag: {
      type: String,
      default: "ul",
    },
    totalItems: {
      type: Number,
      required: true,
    },
    pageSize: {
      type: Number,
      default: 50,
    },
  },
  emits: ["onScroll"],
  setup(props, { emit }) {
    let page = 0;
    const refComponent = ref(null);
    const state = reactive({
      customComponentId: "",
      paginator: {},
    });

    const handlerScroll = (evt) => {
      let scrollTop = evt.currentTarget.scrollTop;
      let scrollHeight = evt.currentTarget.scrollHeight;
      let offsetHeight = evt.currentTarget.offsetHeight;
      var contentHeight = scrollHeight - offsetHeight; // added
      if (contentHeight <= scrollTop) {
        // modified
        // Now this is called when scroll end!
        if (state.paginator.currentPage < state.paginator.endPage) {
          state.paginator = util.logicPaginate(
            props.totalItems,
            ++state.paginator.currentPage,
            props.pageSize,
            props.totalItems / props.pageSize
          );
          emit("onScroll", state.paginator);
        }
      }
    };
    onBeforeMount(() => {
       // generate ID
      _uid++;
      state.customComponentId = `infinite-scroll-component-${props.tag}-${_uid}`;
      
      state.paginator = util.logicPaginate(
        props.totalItems,
        1,
        props.pageSize,
        props.totalItems / props.pageSize
      );

      emit("onScroll", state.paginator);
    });

    onMounted(() => {
      setScrollEvent();
    });

    const setScrollEvent = () => {
      refComponent.value.addEventListener("scroll", (evt) =>
        handlerScroll(evt)
      );
    };

    return {
      ...toRefs(state),
      refComponent,
    };
  },
});
</script>