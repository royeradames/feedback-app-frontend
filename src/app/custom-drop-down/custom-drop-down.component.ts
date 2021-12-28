import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-custom-drop-down',
  templateUrl: './custom-drop-down.component.html',
  styleUrls: ['./custom-drop-down.component.scss'],
})
export class CustomDropDownComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
  isHidden: boolean = true;
  isFocus: boolean = false;
}
