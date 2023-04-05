import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { defer, NEVER } from 'rxjs';
import { finalize, share } from 'rxjs/operators';

//component
import { LoaderComponent } from '../components/loader/loader.component';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  public readonly spinner$ = defer(() => {
    this.show();
    return NEVER.pipe(
      finalize(() => {
        this.hide();
      })
    );
  }).pipe(share());
  private overlayRef!: OverlayRef;

  constructor(private readonly overlay: Overlay) {
  }

  private show(): void {
    Promise.resolve(null).then(() => {
      this.overlayRef = this.overlay.create({
        positionStrategy: this.overlay
          .position()
          .global()
          .centerHorizontally()
          .centerVertically(),
        hasBackdrop: true,
      });
      this.overlayRef.attach(new ComponentPortal(LoaderComponent));
    });
  }

  private hide(): void {
    this.overlayRef.detach();
  }
}
