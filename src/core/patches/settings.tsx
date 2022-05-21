import { FormArrow, FormDivider, FormRow, FormSection } from '@components';
import { getByDisplayName, getByName, getByTypeName } from '@metro';
import { connectComponent } from '@api/settings';
import { Locale, Scenes } from '@metro/common';
import * as Screens from '@screens/index';
import { create } from '@patcher';
import React from 'react';
import ThemeIcon from '@screens/partials/ThemeIcon';
import PluginIcon from '@screens/partials/PluginIcon';

const Patcher = create('enmity-settings');

export default function (): void {
  patchScreens();
  patchSettings();
}

export let forceUpdateSettings = null;

function patchScreens() {
  Patcher.after(Scenes, 'default', (_, args, res) => {
    return {
      ...res,
      Enmity: {
        key: 'Enmity',
        title: 'Enmity',
        render: connectComponent(Screens.Enmity.Page, 'enmity'),
        headerRight: Screens.Enmity.HeaderRight
      },
      EnmityPlugins: {
        key: 'Enmity Plugins',
        title: 'Plugins',
        render: Screens.Plugins.Page,
        headerRight: Screens.Plugins.HeaderRight
      },
      EnmityThemes: {
        key: 'Enmity Themes',
        title: 'Themes',
        render: Screens.Themes.Page,
        headerRight: Screens.Themes.HeaderRight
      }
    };
  });
}

export const patch = {
  status: false,
  forceUpdate: () => { },
  navigator: null,
  handleSectionSelect: () => { }
};

function patchSettings() {
  const Settings = getByTypeName('UserSettingsOverviewWrapper', { default: false });
  Patcher.after(Settings, 'default', (_, __, ret) => {
    const forceUpdate = React.useState({})[1];
    patch.forceUpdate = () => forceUpdate({});

    const { navigation } = ret.props;
    patch.navigator = navigation;

    if (patch.status) return;
    Patcher.after(ret.type.prototype, 'render', (_, args, res) => {
      const { children } = res.props;
      const index = children.findIndex(x => x.props.title === Locale.Messages['PREMIUM_SETTINGS']);
      patch.handleSectionSelect = (...args) => {
        return ret.type.prototype.handleSectionSelect.apply(_, args);
      };

      children.splice(index, 0, <>
        <FormSection key='Enmity' title='Enmity'>
          <FormRow
            label='General'
            leading={<FormRow.Icon source={{ uri: 'https://files.enmity.app/icon-64.png' }} />}
            trailing={<FormArrow />}
            onPress={() => void navigation.push('Enmity')}
          />
          <FormDivider />
          <FormRow
            label='Plugins'
            leading={<PluginIcon width={24} height={24} />}
            trailing={<FormArrow />}
            onPress={() => void navigation.push('EnmityPlugins')}
          />
          <FormDivider />
          <FormRow
            label='Themes'
            leading={<ThemeIcon width={24} height={24} />}
            trailing={<FormArrow />}
            onPress={() => void navigation.push('EnmityThemes')}
          />
          <FormDivider />
        </FormSection>
      </>);
    });

    patch.status = true;
  });
}
