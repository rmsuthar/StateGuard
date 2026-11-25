import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import type { AttributeList, Guard, StateGuardStatic, ViolationDetail } from './StateGuard';

/** Payload emitted by the `(violation)` output. */
export interface StateGuardViolation extends ViolationDetail {
    element: HTMLElement;
    count: number;
}

/**
 * StateGuard must be loaded as a global script, e.g. in angular.json:
 *   "scripts": ["node_modules/@rsuthar/state-guard-js/dist/state-guard.min.js"]
 */
function resolveStateGuard(): StateGuardStatic {
    const sg = (globalThis as { StateGuard?: StateGuardStatic }).StateGuard;
    if (!sg || typeof sg.guard !== 'function') {
        throw new Error(
            '[StateGuard] global not found. Add "node_modules/@rsuthar/state-guard-js/dist/state-guard.min.js" ' +
            'to the "scripts" array in angular.json.'
        );
    }
    return sg;
}

/**
 * <button appStateGuard #g="stateGuard"
 *         [protectedAttributes]="['disabled']" [maxAttempts]="3"
 *         (violation)="onTamper($event)">Pay</button>
 *
 * g.update(el => el.removeAttribute('disabled'));
 *
 * Inputs are read once, on init.
 */
@Directive({
    selector: '[appStateGuard]',
    exportAs: 'stateGuard',
    standalone: true
})
export class StateGuardDirective implements OnInit, OnDestroy {
    @Input() protectedAttributes: AttributeList = 'all';
    @Input() maxAttempts = 3;
    @Output() readonly violation = new EventEmitter<StateGuardViolation>();

    private guard: Guard<HTMLElement> | null = null;

    constructor(private readonly el: ElementRef<HTMLElement>) { }

    ngOnInit(): void {
        this.guard = resolveStateGuard().guard(this.el.nativeElement, {
            attributes: this.protectedAttributes,
            maxAttempts: this.maxAttempts,
            onViolation: (element, count, detail) => this.violation.emit({ element, count, ...detail })
        });
    }

    /** Authorized change. Returns fn's result, or undefined before init. */
    public update<T>(fn: (el: HTMLElement) => T): T | undefined {
        return this.guard ? this.guard.exec(fn) : undefined;
    }

    ngOnDestroy(): void {
        if (this.guard) this.guard.disconnect();
        this.guard = null;
    }
}
