<template>
  <Modal
    :hasHeader="false"
    :class="'custom-modal-content'"
    :transitionName="'bounce'"
    v-model:value="alertOpen"
    @onCloseModal="alertOpen = $event"
  >
    <template v-slot:body>
      <section class="d-flex flex-column bd-highlight mb-3">
        <section class="p-2 bd-highlight">
          <section
            :style="
              'border-radius: 50%; min-width: 120px; min-height: 120px; max-height: 120px; max-width: 120px; display: flex; align-items: center; justify-content: center; margin: auto;' +
                (color ? 'color: ' + color + ';' : '')
            "
          >
            <i class="far fa-check-circle fa-7x" v-if="internalAlert === 0"></i>
            <i class="far fa-times-circle fa-7x" v-if="internalAlert === 1"></i>
            <i class="fas fa-info-circle fa-7x" v-if="internalAlert === 2"></i>
            <i
              class="fas fa-exclamation-circle fa-7x"
              v-if="internalAlert === 3"
            ></i>
            <i
              class="far fa-question-circle fa-7x"
              v-if="internalAlert === 4"
            ></i>
          </section>
        </section>
        <section class="p-2 bd-highlight">
          <h2 class="d-flex justify-content-center">
            {{ internalTitle }}
          </h2>
        </section>
        <section class="bd-highlight">
          <p class="d-flex justify-content-center modal-text">
            {{ internalMessage }}
          </p>
        </section>
        <section class="d-flex justify-content-center">
          <button
            aria-label
            type="button"
            :class="
              `btn btn-lg btn-success ${internalAlert == 4 ? 'mr-3' : ''}`
            "
            value="true"
            @click="resolvePromise(true)"
          >
            OK
          </button>
          <button
            v-if="internalAlert == 4"
            aria-label
            type="button"
            class="btn btn-lg btn-secondary"
            value="false"
            @click="resolvePromise(false)"
          >
            Cancel
          </button>
        </section>
      </section>
    </template>
  </Modal>
</template>

<script>
/* eslint-disable no-unused-vars */
/* eslint-disable */
let _uid = 0;
import Modal from "@/components/Modal.vue";
import {
  defineComponent,
  ref,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  onBeforeUpdate,
  computed,
  onUpdated,
  toRefs,
  reactive,
} from "vue";

export default defineComponent({
  extends: Modal,
  name: "ModalAlert",
  props: {},
  emits: ["close::alert"],
  components: {
    Modal,
  },
  setup(props, { emit }) {
    const state = reactive({
      alertId: "",
      alertOpen: false,
      internalTitle: "",
      internalMessage: "",
      internalAlert: -1,
      color: "",
      internalTypeAlert: {
        success: 0,
        error: 1,
        info: 2,
        warning: 3,
        question: 4,
      },
      resolvePromise: (flag) => {return new Promise((resolve, reject)=>{})},
      rejectPromise: (error) => {return new Promise((resolve, reject)=>{})},
    });

    onBeforeUpdate(() => {
      // generate ID
      _uid++;
      state.alertId = `ui-vue-alert-id-${_uid}`;
    });

    const toggleAlertState = () => {
      state.alertOpen = !state.alertOpen;
    };

    const success = (title = "", message = "") => {
      if (validateInput(title, message)) {
        state.internalAlert = state.internalTypeAlert.success;
        state.internalTitle = title;
        state.internalMessage = message;
        state.color = "#0bb37d";
        toggleAlertState();
        return new Promise((resolve) => {
          state.resolvePromise = (flag) => {
            resolve(flag);
            state.alertOpen = false;
          };
        });
      }
    };

    const error = (title = "", message = "") => {
      if (validateInput(title, message)) {
        state.internalAlert = state.internalTypeAlert.error;
        state.internalTitle = title;
        state.internalMessage = message;
        state.color = "#dc3545";
        toggleAlertState();
        return new Promise((resolve) => {
          state.resolvePromise = (flag) => {
            resolve(flag);
            state.alertOpen = false;
          };
        });
      }
    };

    const warning = (title = "", message = "") => {
      if (validateInput(title, message)) {
        state.internalAlert = state.internalTypeAlert.warning;
        state.internalTitle = title;
        state.internalMessage = message;
        state.color = "#ffe001";
        toggleAlertState();
        return new Promise((resolve) => {
          state.resolvePromise = (flag) => {
            resolve(flag);
            state.alertOpen = false;
          };
        });
      }
    };

    const info = (title = "", message = "") => {
      if (validateInput(title, message)) {
        state.internalAlert = state.internalTypeAlert.info;
        state.internalTitle = title;
        state.internalMessage = message;
        state.color = "#117a8b";
        toggleAlertState();
        return new Promise((resolve) => {
          state.resolvePromise = (flag) => {
            resolve(flag);
            state.alertOpen = false;
          };
        });
      }
    };

    const question = (title = "", message = "") => {
      if (validateInput(title, message)) {
        state.internalAlert = state.internalTypeAlert.question;
        state.internalTitle = title;
        state.internalMessage = message;
        state.color = "#adb5bdbf";
        toggleAlertState();
        return new Promise((resolve, reject) => {
          state.resolvePromise = (flag) => {
            resolve(flag);
            state.alertOpen = false;
          };
          state.rejectPromise = (error) => {
            reject(error);
            state.alertOpen = false;
          };
        });
      }
    };

    const validateInput = (title = "", message = "") => {
      if (!title || !message || title.length == 0 || message.length == 0) {
        console.error(
          "Props [title, message and typeMessage] cannot be undefined or empty."
        );
        return false;
      }
      return true;
    };

    return {
      success,
      error,
      warning,
      info,
      question,
      ...toRefs(state)
    };
  },
});
</script>
<style lang="scss">
.custom-modal-content {
  border-radius: 1.3rem !important;
}

.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0.9);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>

<style lang="scss" scoped>
.btn-success {
  background-color: #0bb37d;
}

.btn-success:hover {
  background: #1d9d74;
}

.btn-success:active {
  background: #1c8b68;
}

.btn-modal-cancel {
  border: 0;
  border-radius: 0.25em;
  background: initial;
  background-color: #aaa;
  color: #fff;
  font-size: 1.0625em;
  width: 150px;
}

.btn-modal-cancel:hover {
  background-color: rgb(158, 158, 158);
}

.btn-modal-cancel:active {
  background-color: rgb(148, 148, 148);
  border: rgb(190, 190, 190) solid 2px;
  border-radius: 10px;
  box-shadow: 0px 0px 0px 2px #fff inset;
  outline: none;
}

.modal-text {
  font-size: 1.2em;
}
</style>
