import React from 'react';
import {createRoot} from 'react-dom/client';
import AppRoot from '../../app/app-root';
import '../../app/globals.css';
import {installCloudTransport} from './cloud-transport';
installCloudTransport();
createRoot(document.getElementById('root')!).render(<AppRoot/>);
