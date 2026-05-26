/**
 * Recursively overlays/merges keys and array elements representing new codebase components or fields
 * from codeMaster (INITIAL_DATA) to the stored data, ensuring zero database-overwriting loss while
 * automatically displaying newly added publications, blogs, or config fields.
 */
export function smartMergeData(stored: any, codeMaster: any): { merged: any; updated: boolean } {
  let updated = false;

  if (typeof stored !== typeof codeMaster || stored === null || codeMaster === null) {
    return { merged: codeMaster, updated: true };
  }

  // Handle arrays
  if (Array.isArray(codeMaster)) {
    if (!Array.isArray(stored)) {
      return { merged: codeMaster, updated: true };
    }

    const mergedArray = [...stored];
    // Check if items in codeMaster are missing in stored
    for (const codeItem of codeMaster) {
      if (codeItem && typeof codeItem === 'object' && codeItem.id) {
        // Match by id
        const exists = stored.some((item: any) => item && item.id === codeItem.id);
        if (!exists) {
          mergedArray.push(codeItem);
          updated = true;
        } else {
          // If exists, check recursively inside it (nested values)
          const storedIndex = mergedArray.findIndex((item: any) => item && item.id === codeItem.id);
          const { merged: mergedEl, updated: elUpdated } = smartMergeData(mergedArray[storedIndex], codeItem);
          if (elUpdated) {
            mergedArray[storedIndex] = mergedEl;
            updated = true;
          }
        }
      } else if (typeof codeItem !== 'object') {
        // Primitive array: match by value
        const exists = stored.includes(codeItem);
        if (!exists) {
          mergedArray.push(codeItem);
          updated = true;
        }
      }
    }
    return { merged: mergedArray, updated };
  }

  // Handle objects
  if (typeof codeMaster === 'object') {
    const mergedObj = { ...stored };
    for (const key in codeMaster) {
      if (!(key in stored)) {
        // Missing property in stored dataset, import it from codeMaster
        mergedObj[key] = codeMaster[key];
        updated = true;
      } else {
        // Recursively merge
        const { merged: mergedVal, updated: valUpdated } = smartMergeData(stored[key], codeMaster[key]);
        if (valUpdated) {
          mergedObj[key] = mergedVal;
          updated = true;
        }
      }
    }
    return { merged: mergedObj, updated };
  }

  return { merged: stored, updated };
}
