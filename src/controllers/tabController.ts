export class TabController {
  constructor(private activeTab = "main") {}

  getActiveTab(): string {
    return this.activeTab;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}
