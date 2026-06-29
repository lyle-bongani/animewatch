// Returning null for any non-intercepted route keeps the modal closed when the
// user navigates elsewhere via client-side transitions.
export default function CatchAll() {
  return null;
}
