import React from 'react';
import ReactDOM from 'react-dom';
import { navigate } from '@reach/router';
import { Utils } from './utils/utils';
import { isPro, gettext, siteRoot, mediaUrl, logoPath, logoWidth, logoHeight, siteTitle } from './utils/constants';
import { seafileAPI } from './utils/seafile-api';
import toaster from './components/toast';
import CommonToolbar from './components/toolbar/common-toolbar';
import SideNav from './components/user-settings/side-nav';
import UserAvatarForm from './components/user-settings/user-avatar-form';
import UserBasicInfoForm from './components/user-settings/user-basic-info-form';
import WebdavPassword from './components/user-settings/webdav-password';
import LanguageSetting from './components/user-settings/language-setting';
import ListInAddressBook from './components/user-settings/list-in-address-book';
import EmailNotice from './components/user-settings/email-notice';
import TwoFactorAuthentication from './components/user-settings/two-factor-auth';
import SocialLogin from './components/user-settings/social-login';
import DeleteAccount from './components/user-settings/delete-account';

import './css/toolbar.css';
import './css/search.css';

import './css/user-settings.css';

const { 
  canUpdatePassword, passwordOperationText,
  enableAddressBook,
  enableWebdavSecret,
  twoFactorAuthEnabled,
  enableWechatWork,
  enableDeleteAccount
} = window.app.pageOptions;

class Settings extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    seafileAPI.getUserInfo().then((res) => {
      this.setState({
        userInfo: res.data
      });
    }).catch((error) => {
      // do nothing
    });
  }

  updateUserInfo = (data) => {
    seafileAPI.updateUserInfo(data).then((res) => {
      this.setState({
        userInfo: res.data
      });
      toaster.success(gettext('Success'));
    }).catch((error) => {
      let errorMsg = '';
      if (error.response) {
        if (error.response.data && error.response.data['error_msg']) {
          errorMsg = error.response.data['error_msg'];
        } else {
          errorMsg = gettext('Error');
        }
      } else {
        errorMsg = gettext('Please check the network.');
      }
      toaster.danger(errorMsg);
    });
  }

  onSearchedClick = (selectedItem) => {
    if (selectedItem.is_dir === true) {
      let url = siteRoot + 'library/' + selectedItem.repo_id + '/' + selectedItem.repo_name + selectedItem.path;
      navigate(url, {repalce: true});
    } else {
      let url = siteRoot + 'lib/' + selectedItem.repo_id + '/file' + Utils.encodePath(selectedItem.path);
      let newWindow = window.open('about:blank');
      newWindow.location.href = url;
    }
  }

  render() {
    return (
      <React.Fragment>
        <div className="h-100 d-flex flex-column">
          <div className="top-header d-flex justify-content-between">
            <a href={siteRoot}>
              <img src={mediaUrl + logoPath} height={logoHeight} width={logoWidth} title={siteTitle} alt="logo" />
            </a>
            <CommonToolbar onSearchedClick={this.onSearchedClick} />
          </div>
          <div className="flex-auto d-flex">
            <div className="side-panel o-auto">
              <SideNav />
            </div>
            <div className="main-panel d-flex flex-column">
              <h2 className="heading">{gettext('Settings')}</h2>
              <div className="content">
                <div id="user-basic-info" className="setting-item">
                  <h3 className="setting-item-heading">{gettext('Profile Setting')}</h3>
                  <UserAvatarForm  />
                  {this.state.userInfo && <UserBasicInfoForm userInfo={this.state.userInfo} updateUserInfo={this.updateUserInfo} />}
                </div>
                {canUpdatePassword &&
                <div id="update-user-passwd" className="setting-item">
                  <h3 className="setting-item-heading">{gettext('Password')}</h3>
                  <a href={`${siteRoot}accounts/password/change/`} className="btn btn-secondary">{passwordOperationText}</a>
                </div>
                }
                {enableWebdavSecret && <WebdavPassword />}
                {enableAddressBook && this.state.userInfo && 
                <ListInAddressBook userInfo={this.state.userInfo} updateUserInfo={this.updateUserInfo} />}
                <LanguageSetting />
                {isPro && <EmailNotice />}
                {twoFactorAuthEnabled && <TwoFactorAuthentication />}
                {enableWechatWork && <SocialLogin />}
                {enableDeleteAccount && <DeleteAccount />}
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

ReactDOM.render(
  <Settings />,
  document.getElementById('wrapper')
);