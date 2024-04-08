import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Observable, Subject, Subscription, take, takeUntil, tap } from 'rxjs';

class FakeService {
  private value: Subject<string> = new Subject<string>();

  get(): Observable<string> {
    return this.value.asObservable();
  }

  loadData() {
    this.value.next('fake');
  }
}
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy{
  public title = 'marble';
  private service: FakeService;
  private destroy$: Subject<void> = new Subject<void>();
  private service$: any;
  public fakeFlag: boolean = false;


  public result: string = '';

  constructor() {
    this.service = new FakeService();
    this.service$ = this.service.get();
  }

  public ngOnInit(): void {
    this.setFlag(this.service$);
    this.service.loadData();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setFlag(obs: Observable<string>) {
    obs.pipe(
      takeUntil(this.destroy$),
      tap((result) => (this.result = result)),
      tap(console.log)
    ).subscribe({
      next: (result) => {
        this.fakeFlag = (result === 'fake');
        console.log('Resultado Flag: ', this.fakeFlag, result);
      },
      error: (error) => console.log('Erro:', error),
      complete: () => console.log('complete')
    });
  }

}
