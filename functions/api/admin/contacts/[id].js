import { 
  onRequestDelete as handleDelete, 
  onRequestPut as handlePut,
  onRequestOptions as handleOptions 
} from '../contacts.js';

export async function onRequestOptions() {
  return handleOptions();
}

export async function onRequestPut(context) {
  return handlePut(context);
}

export async function onRequestDelete(context) {
  return handleDelete(context);
}
