import { Friend } from "./friend";
import { Messages } from "./messages";
import { Post } from "./post";

export interface UserInformation{
    id: string;
    friends: Friend[];
    messages: Messages[];
    posts: Post[]; 
}

