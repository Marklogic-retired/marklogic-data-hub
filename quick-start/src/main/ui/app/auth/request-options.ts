import { Injectable } from '@angular/core';
import { provide } from '@angular/core';
import { HTTP_PROVIDERS, BaseRequestOptions, RequestOptions, RequestOptionsArgs } from '@angular/http';

@Injectable()
class HubRequestOptions extends RequestOptions {

  merge(options?:RequestOptionsArgs):RequestOptions {
    let result = new HubRequestOptions(super.merge(options));
    result.url = window['BASE_URL'] + result.url;
    return result;
  }
}

export const REQUEST_PROVIDER =
  provide(RequestOptions, { useClass: HubRequestOptions });
