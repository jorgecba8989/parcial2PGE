import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent {
  @Input() isVisible: boolean = false;
  @Input() message: string = 'Cargando...';

  letters = ['U', 'B', 'P'];
}