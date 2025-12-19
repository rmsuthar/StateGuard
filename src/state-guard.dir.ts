import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

@Directive({
    selector: '[appStateGuard]',
    exportAs: 'stateGuard'
})
export class StateGuardDirective implements OnInit, OnDestroy {
    @Input() protectedAttributes: string[] | 'all' = 'all';
    private guard: any;

    constructor(private el: ElementRef) { }

    ngOnInit() {
        this.guard = new (window as any).StateGuard.Guard(this.el.nativeElement, {
            attributes: this.protectedAttributes
        });
    }

    public update(fn: (el: HTMLElement) => void) {
        this.guard.exec(fn);
    }

    // CLEANUP: Called when the element is removed from the DOM
    ngOnDestroy() {
        if (this.guard && this.guard.obs) {
            this.guard.obs.disconnect();
        }
    }
}