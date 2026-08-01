/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as albums from "../albums.js";
import type * as applications from "../applications.js";
import type * as bookings from "../bookings.js";
import type * as categories from "../categories.js";
import type * as dashboard from "../dashboard.js";
import type * as explore from "../explore.js";
import type * as http from "../http.js";
import type * as invitations from "../invitations.js";
import type * as jobRequests from "../jobRequests.js";
import type * as messages from "../messages.js";
import type * as models from "../models.js";
import type * as mux from "../mux.js";
import type * as notifications from "../notifications.js";
import type * as payments from "../payments.js";
import type * as paystack from "../paystack.js";
import type * as portfolio from "../portfolio.js";
import type * as push from "../push.js";
import type * as pushSender from "../pushSender.js";
import type * as reviews from "../reviews.js";
import type * as savedModels from "../savedModels.js";
import type * as settings from "../settings.js";
import type * as storage from "../storage.js";
import type * as subscriptions from "../subscriptions.js";
import type * as support from "../support.js";
import type * as testimonials from "../testimonials.js";
import type * as users from "../users.js";
import type * as wallets from "../wallets.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  albums: typeof albums;
  applications: typeof applications;
  bookings: typeof bookings;
  categories: typeof categories;
  dashboard: typeof dashboard;
  explore: typeof explore;
  http: typeof http;
  invitations: typeof invitations;
  jobRequests: typeof jobRequests;
  messages: typeof messages;
  models: typeof models;
  mux: typeof mux;
  notifications: typeof notifications;
  payments: typeof payments;
  paystack: typeof paystack;
  portfolio: typeof portfolio;
  push: typeof push;
  pushSender: typeof pushSender;
  reviews: typeof reviews;
  savedModels: typeof savedModels;
  settings: typeof settings;
  storage: typeof storage;
  subscriptions: typeof subscriptions;
  support: typeof support;
  testimonials: typeof testimonials;
  users: typeof users;
  wallets: typeof wallets;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
