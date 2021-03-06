import { Injectable, Optional } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';

/**
 * User's idle service.
 */
@Injectable()
export class AccountIdleService {
  ping$: Observable<any>;

  /**
   * Events that can interrupts user's inactivity timer.
   */
  private readonly activityEvents$: Observable<any>;

  private timerStart$ = new Subject<boolean>();
  private timeout$ = new Subject<boolean>();
  private idle$: Observable<any>;
  private timer$: Observable<any>;

  private idle = 600; // seconds user is idle before they get kicked out
  private timeout = 1; // count down to logging out after idle time has passed
  private isTimeout: boolean;
  private isInactivityTimer: boolean;
  private idleSubscription: Subscription;

  
  constructor() {
    this.activityEvents$ = Observable.merge(
      Observable.fromEvent(window, 'mousemove'),
      Observable.fromEvent(window, 'resize'),
      Observable.fromEvent(document, 'keydown'));
    this.idle$ = Observable.from(this.activityEvents$);
  }

  /**
   * Start watching for user idle and setup timer and ping.
   */
  startWatching() {
    this.idleSubscription = this.idle$
      .bufferTime(5000)  // Starting point of detecting of user's inactivity
      .filter(arr => !arr.length && !this.isInactivityTimer)
      .switchMap(() => {
        this.isInactivityTimer = true;
        return Observable.interval(15000).takeUntil(Observable.merge(
            this.activityEvents$,
            Observable.timer(this.idle * 1000)
              .do(() => this.timerStart$.next(true))))
          .finally(() => this.isInactivityTimer = false);
      })
      .subscribe();
    this.setupTimer(this.timeout);
  }

  stopWatching() {
    this.stopTimer();
    if (this.idleSubscription) {
      this.idleSubscription.unsubscribe();
    }
  }

  stopTimer() {
    this.timerStart$.next(false);
  }

  resetTimer() {
    this.stopTimer();
    this.isTimeout = false;
  }

  /**
   * Return observable for timer's countdown number that emits after idle.
   * @return {Observable<number>}
   */
  onTimerStart(): Observable<number> {
    return this.timerStart$
      .distinctUntilChanged()
      .switchMap(start => start ? this.timer$ : Observable.of(null));
  }

  /**
   * Return observable for timeout is fired.
   * @return {Observable<boolean>}
   */
  onTimeout(): Observable<boolean> {
    return this.timeout$
      .filter(timeout => !!timeout)
      .map(() => {
        this.isTimeout = true;
        return true;
      });
  }

  /**
   * Setup timer.
   *
   * Counts every seconds and return n+1 and fire timeout for last count.
   * @param timeout Timeout in seconds.
   */
  private setupTimer(timeout: number) {
    this.timer$ = Observable.interval(1000)
      .take(timeout)
      .map(() => 1)
      .scan((acc, n) => acc + n)
      .map(count => {
        if (count === timeout) {
          this.timeout$.next(true);
        }
        return count;
      });
  }


}
