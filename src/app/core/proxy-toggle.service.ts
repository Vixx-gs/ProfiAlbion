import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ProxyStatus {
  enabled: boolean;
  server: string;
}

@Injectable({ providedIn: 'root' })
export class ProxyToggleService {
  private readonly http = inject(HttpClient);
  private readonly base = 'http://127.0.0.1:3456';

  getStatus(): Observable<ProxyStatus> {
    return this.http.get<ProxyStatus>(`${this.base}/proxy/status`).pipe(
      catchError(() => of({ enabled: false, server: '' })),
    );
  }

  enable(): Observable<ProxyStatus> {
    return this.http.get<ProxyStatus>(`${this.base}/proxy/enable`).pipe(
      catchError(() => of({ enabled: false, server: '' })),
    );
  }

  disable(): Observable<ProxyStatus> {
    return this.http.get<ProxyStatus>(`${this.base}/proxy/disable`).pipe(
      catchError(() => of({ enabled: false, server: '' })),
    );
  }

  toggle(current: boolean): Observable<ProxyStatus> {
    return current ? this.disable() : this.enable();
  }
}
