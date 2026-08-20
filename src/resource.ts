// File generated from our OpenAPI spec by Scalar. See README.md for details.

import type { CrmAPI } from './client';

export abstract class APIResource {
  protected _client: CrmAPI;

  constructor(client: CrmAPI) {
    this._client = client;
  }
}
