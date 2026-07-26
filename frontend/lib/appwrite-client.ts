import { Client, Account, Databases, Functions, Storage } from 'appwrite';
import { getAppwriteEndpoint, getAppwriteProjectId } from './appwrite-config';

const client = new Client().setEndpoint(getAppwriteEndpoint()).setProject(getAppwriteProjectId());

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
