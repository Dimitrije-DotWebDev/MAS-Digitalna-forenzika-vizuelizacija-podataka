import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableFriendNode {
  username: string;
  gender: string;
  age: number;
  occupation: string;
  city: string;
  country: string;
  messagesCount: number;
  totalPosts: number;
}

@Component({
  selector: 'app-forensic-table-modal',
  templateUrl: './forensic-table-modal.component.html',
  styleUrls: ['./forensic-table-modal.component.scss']
})
export class ForensicTableModalComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() data: TableFriendNode[] = [];
  @Output() closeEmitter = new EventEmitter<void>();

  localTableData: TableFriendNode[] = [];
  currentSortKey: string = '';
  isSortAscending: boolean = true;

  ngOnChanges(changes: SimpleChanges): void {
    // Kad god se podaci promene u roditelju, osvežavamo naš lokalni niz za prikaz
    if (changes['data']) {
      this.localTableData = [...this.data];
      if (this.currentSortKey) {
        this.executeSort(this.currentSortKey as keyof TableFriendNode);
      }
    }
  }

  closeModal(): void {
    this.closeEmitter.emit();
  }

  sortTable(key: keyof TableFriendNode): void {
    if (this.currentSortKey === key) {
      this.isSortAscending = !this.isSortAscending;
    } else {
      this.currentSortKey = key;
      this.isSortAscending = true;
    }
    this.executeSort(key);
  }

  private executeSort(key: keyof TableFriendNode): void {
    this.localTableData.sort((a, b) => {
      const valA = a[key];
      const valB = b[key];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return this.isSortAscending ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return this.isSortAscending ? -1 : 1;
      if (strA > strB) return this.isSortAscending ? 1 : -1;
      return 0;
    });
  }

  getSortIcon(key: string): string {
    if (this.currentSortKey !== key) return '↕';
    return this.isSortAscending ? '▲' : '▼';
  }
}