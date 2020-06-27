
export function isJsonString(json: string) {
  try {
    if (typeof JSON.parse(json) == "object") {
      return true;
    }
  } catch (e) {
    // empty
  }
  return false;
}