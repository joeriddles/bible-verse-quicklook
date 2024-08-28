import { App, Plugin, PluginSettingTab } from 'obsidian';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Settings {
  
}

const DEFAULT_SETTINGS: Settings = {
  
}

interface IPlugin extends Plugin {
  settings: Settings

  saveSettings(): Promise<void>
}


class SettingsTab extends PluginSettingTab {
  plugin: IPlugin

  constructor(app: App, plugin: IPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this

    containerEl.empty()
    this.containerEl.createEl("h2", { text: "Bible Verse Quicklook" });

    // new Setting(containerEl)
    //   .setName('TODO filename')
    //   .addText(text => text
    //     .setValue(this.plugin.settings.todoFilename)
    //     .onChange(async (value) => {
    //       this.plugin.settings.todoFilename = value
    //       await this.plugin.saveSettings()
    //     }))
  }
}

export { DEFAULT_SETTINGS, SettingsTab };
export type { Settings };

