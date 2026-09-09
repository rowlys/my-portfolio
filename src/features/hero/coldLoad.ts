export let isColdLoad = true;

export function markWarm() {
  isColdLoad = false;
}
