<template>
  <section
    class="ui-vue-popover"
    role="tooltip"
    v-if="isOpen"
    style="display: none"
    ref="popoverContent"
    :name="name"
    :id="popoverId"
    tabindex="-1"
  >
    <section class="ui-vue-popover-content" :data-popper-placement="placement">
      <section class="ui-vue-popover-header" v-if="hasHeader">
        <h3>{{ title }}</h3>
      </section>
      <hr v-if="hasHeader" class="ui-vue-popover-divide" />
      <div class="ui-vue-popover-body">
        <slot></slot>
      </div>
      <i></i>
    </section>
  </section>
</template>

<script>
// @ is an alias to /src
import { defineComponent, ref, onBeforeMount, onMounted } from "vue";
import { createPopper } from "@popperjs/core";
import "@/assets/ui-vue-popover.scss";
import eventBus from "@/utils/eventbus.js";
let _uid = 0;
export default defineComponent({
  name: "Popover",
  props: {
    name: {
      type: String,
      required: true
    },
    hasHeader: {
      type: Boolean,
      required: false,
      default: () => false
    },
    title: {
      type: String,
      required: false,
      default: () => ""
    },
    placement: {
      type: String,
      required: false,
      default: () => "bottom"
    },
    trigger: {
      type: String,
      required: false,
      default: () => "click"
    }
  },
  setup(props) {
    const popperInstance = ref(null);
    const popoverContent = ref(null);
    const popoverId = ref("");
    const isOpen = ref(false);
    onBeforeMount(() => {
      _uid++;
      popoverId.value = `v-popoverId-${_uid}`;
      eventBus().on("close-popover", () => {
        isOpen.value = false;
      });
    });

    const initPopper = () => {
      if (!props.placement)
        console.error("Param [placement] cannot be undefined or empty.");

      const button = document.querySelector(`button[to-popover=${props.name}]`);
      if (!button)
        console.error(
          "Reference element for the popover was not found.\nPlease fill in the [to-popover] attribute."
        );

      function defineStyle(tooltip) {
        tooltip.style.display = "inline-block";
        tooltip.style.position = "relative";
        tooltip.style.textAlign = "left";
      }

      function create(tooltip) {
        let xPosition = 0;
        let yPosition = 0;
        switch (props.placement) {
          case "bottom":
            yPosition = -15;
            break;
          case "left":
            xPosition = 100;
            yPosition = -15;
            break;

          case "right":
            xPosition = -100;
            yPosition = -15;
            break;
          case "top":
            yPosition = -35;
            break;

          default:
            console.error(
              "Param [placement] can only be {top, right, bottom, left}."
            );
            break;
        }
        popperInstance.value = createPopper(button, tooltip, {
          placement: props.placement,
          preventOverflow: {
            boundariesElement: "viewport"
          },
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [xPosition, yPosition]
              }
            }
          ]
        });
      }

      function destroy() {
        if (popperInstance.value) {
          popperInstance.value.destroy();
          popperInstance.value = null;
          eventBus().emit("close-popover");
        }
      }

      function toggle(e) {
        e.stopPropagation();
        isOpen.value = !isOpen.value;
        setTimeout(() => {
          const tooltip = document.querySelector(`#${popoverId.value}`);
          if (isOpen.value) {
            tooltip.setAttribute("data-show", "");
            create(tooltip);
            defineStyle(tooltip);
            tooltip.addEventListener("keydown", event => {
              event.stopPropagation();
              const key = event.key; // const {key} = event; in ES6+
              if (key === "Escape") {
                hide(event);
              }
            });
          } else {
            destroy();
          }
        }, 100);
      }

      function showPopper(e) {
        e.stopPropagation();
        isOpen.value = true;
        setTimeout(() => {
          const tooltip = document.querySelector(`#${popoverId.value}`);
          tooltip.setAttribute("data-show", "");
          create(tooltip);
          defineStyle(tooltip);
        }, 100);
      }

      function hide(e) {
        e.stopPropagation();
        isOpen.value = false;
        destroy();
      }

      const triggerEvents = [...props.trigger.split(",")];

      triggerEvents.forEach(event => {
        switch (event) {
          case "click":
            button.addEventListener(event, e => toggle(e));
            button.addEventListener("keydown", event => {
              event.stopPropagation();
              const key = event.key; // const {key} = event; in ES6+
              if (key === "Escape") {
                hide(event);
              }
            });
            break;
          case "mouseenter":
          case "focus":
            button.addEventListener(event, e => showPopper(e));
            button.addEventListener("mouseleave", e => hide(e));
            button.addEventListener("blur", e => hide(e));
            break;
          default:
            break;
        }
      });
    };

    onMounted(() => {
      initPopper();
    });

    return {
      popoverId,
      popoverContent,
      isOpen
    };
  }
});
</script>
