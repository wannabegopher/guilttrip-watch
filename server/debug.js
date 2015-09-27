import Debug from "debug"

const PREFIX = 'guilttrip';

function create(prefix) {
  return Debug([PREFIX, prefix].filter(Boolean).join('-'));
}

const debug = create();
debug.create = create;

export default debug;
