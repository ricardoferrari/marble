import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Observable, Subject, takeUntil, tap } from 'rxjs';

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
  private flags$: any;
  public fakeFlag: boolean = false;


  public result: string = '';

  constructor() {
    this.service = new FakeService();
    this.service$ = this.service.get();
  }

  public ngOnInit(): void {
    this.flags$ = this.setFlag(this.service$);
    this.flags$.subscribe({
      next: (result: string) => {
        console.log('Resultado Flag: ', this.fakeFlag, result);
      },
      error: (error: string) => console.log('Erro:', error),
      complete: () => console.log('complete')
    });
    this.service.loadData();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setFlag(obs: Observable<string>): Observable<string> {
    return obs.pipe(
      takeUntil(this.destroy$),
      tap((result) => {
        this.result = result;
        this.fakeFlag = (result === 'fake');
      }),
      tap(console.log),
    );
  }

}
