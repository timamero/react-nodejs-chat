/**
 * Socket callbacks for updating User
 */
import { store } from "../../../app/store";
import { setId } from "../../../app/features/userSlice";

export const setUserId = (id: string) => {
  store.dispatch(setId(id))
}