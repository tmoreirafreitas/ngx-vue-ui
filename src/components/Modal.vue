<template>
  <Teleport to="body">
    <transition :name="internalTransitionName">
      <div
        class="modal-backdrop"
        role="dialog"
        v-if="isModalOpen"
        :id="modalId"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div :class="internalClass">
            <div class="modal-header" v-if="hasHeader">
              <h5 class="modal-title" v-if="title.length > 0">{{ title }}</h5>
              <button
                type="button"
                class="btn btn-sm btn-close btn-right border-b font-semibold"
                @click="close()"
              ></button>
            </div>
            <div class="modal-body"><slot name="body" /></div>
            <div class="modal-footer" v-if="hasFooter">
              <slot name="footer" />
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script>
/* eslint-disable no-unused-vars */
/* eslint-disable */
let _uid = 0;
import {
  defineComponent,
  ref,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  onBeforeUpdate,
  computed,
  onUpdated,
  reactive,
  toRefs,
} from "vue";

export default defineComponent({
  name: "Modal",
  props: {
    value: {
      type: Boolean,
      required: true,
      default: false,
    },
    id: {
      type: String,
      default: "",
    },
    class: {
      type: String,
      default: "",
    },
    transitionName: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    hasHeader: {
      type: Boolean,
      default: true,
    },
    hasFooter: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["onCloseModal"],
  setup(props, { emit }) {
    const state = reactive({
      isModalOpen: false,
      modalId: "",
      internalClass: "",
      internalTransitionName: ""
    });

    onBeforeMount(() => {
      // generate ID
      _uid++;
      if (props.id) {
        state.modalId = props.id;
      } else {
        state.modalId = `ui-vue-modal-id-${_uid}`;
      }

      state.internalClass = `modal-content ${props.class}`;

      if (!props.transitionName) {
        state.internalTransitionName = "modal-fade";
      } else {
        state.internalTransitionName = props.transitionName;
      }
    });

    onBeforeUpdate(() => {
      state.isModalOpen = props.value;
    });

    function close() {
      emit("onCloseModal", !props.value);
    }

    return {
      close,
      ...toRefs(state)
    };
  },
});
</script>

<style lang="scss" scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: inline-block;
  justify-content: center;
  align-items: center;
}

.modal-fade-enter,
.modal-fade-leave-active {
  opacity: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.5s ease;
}
</style>