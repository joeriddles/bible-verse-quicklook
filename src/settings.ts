import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Settings {
  APIBibleKey?: string,
  
}

const DEFAULT_SETTINGS: Settings = {
  APIBibleKey: undefined,
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

    new Setting(containerEl)
      .setName('API.Bible Key')
      .addText(text => text
        .setValue(this.plugin.settings.APIBibleKey ?? "")
        .onChange(async (value) => {
          this.plugin.settings.APIBibleKey = value
          await this.plugin.saveSettings()
        }))
  }
}

export { DEFAULT_SETTINGS, SettingsTab };
export type { Settings };

