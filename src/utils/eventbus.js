const Emitter = require("tiny-emitter");
const emitter = new Emitter();
const eventBus = () => {
  return emitter;
};
export default eventBus;
