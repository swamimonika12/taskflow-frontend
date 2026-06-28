// utils/extractData.js

export function extract(response) {
  let result = response;

  // Keep unwrapping as long as there's a .data inside
  while (result && typeof result === "object" && "data" in result) {
    result = result.data;
  }

  return result;
}