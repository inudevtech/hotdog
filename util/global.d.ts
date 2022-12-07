import { Dispatch, SetStateAction } from "react";
import { User } from "@firebase/auth";

export interface AccountType {
  AccountState: User | null;
  setAccountState: Dispatch<SetStateAction<User | null>>;
}

export interface UploadFileType {
  uploadFile: File[];
  setUploadFile: Dispatch<SetStateAction<File[]>>;
}
