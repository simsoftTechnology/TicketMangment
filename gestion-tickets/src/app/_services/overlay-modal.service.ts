import { Injectable, ComponentRef } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

@Injectable({ providedIn: 'root' })
export class OverlayModalService {
  private overlayRef: OverlayRef | null = null;
  private componentRef: ComponentRef<any> | null = null;

  constructor(private overlay: Overlay) {}

  open(component: any): any {
    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'custom-backdrop', // on utilisera cette classe dans le CSS
      panelClass: 'modal-panel',
      positionStrategy: this.overlay.position()
        .global()
        .centerHorizontally()
        .centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block()
    });

    const portal = new ComponentPortal(component);
    this.componentRef = this.overlayRef.attach(portal);
    
    this.overlayRef.backdropClick().subscribe(() => this.close());
    
    return this.componentRef.instance;
  }

  close(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
      this.componentRef = null;
    }
  }
}
