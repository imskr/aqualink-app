import { INestApplication } from '@nestjs/common';
import admin from 'firebase-admin';
import * as firebaseAuthStrategy from '../src/auth/firebase-auth.utils';
import * as backfillSiteData from '../src/workers/backfill-site-data';
import * as sofarUtils from '../src/utils/sofar';
import * as liveData from '../src/utils/liveData';
import * as temperatureUtils from '../src/utils/temperature';
import { SurveysService } from '../src/surveys/surveys.service';
import { getMockLiveData, getMockSpotterData } from './mock/daily-data.mock';
import { Site } from '../src/sites/sites.entity';

export const mockExtractAndVerifyToken = (
  firebaseUser: admin.auth.DecodedIdToken | undefined,
) => {
  jest
    .spyOn(firebaseAuthStrategy, 'extractAndVerifyToken')
    .mockImplementationOnce(async () => firebaseUser);
};

export const createMockFirebaseUser = (
  uid: string,
  email: string,
): admin.auth.DecodedIdToken => ({
  aud: 'aud',
  auth_time: 123,
  exp: 123,
  firebase: {
    identities: {},
    sign_in_provider: 'none',
  },
  iat: 123,
  iss: 'iss',
  email,
  sub: 'sub',
  uid,
});

export const mockDeleteFile = (app: INestApplication) => {
  const surveysService = app.get(SurveysService);

  jest
    .spyOn(surveysService.googleCloudService, 'deleteFile')
    .mockImplementation((props: string) => Promise.resolve());
};

export const mockDeleteFileFalling = (app: INestApplication) => {
  const surveysService = app.get(SurveysService);

  jest
    .spyOn(surveysService.googleCloudService, 'deleteFile')
    .mockImplementation((props: string) =>
      Promise.reject(new Error('Delete file failed')),
    );
};

export const mockBackfillSiteData = () => {
  jest
    .spyOn(backfillSiteData, 'backfillSiteData')
    .mockImplementationOnce((props: number) => null);
};

export const mockGetSpotterData = () => {
  jest
    .spyOn(sofarUtils, 'getSpotterData')
    .mockImplementationOnce(
      (sensorId: string, endDate?: Date, startDate?: Date) =>
        Promise.resolve(getMockSpotterData(startDate!, endDate!)),
    );
};

export const mockGetLiveData = () => {
  jest
    .spyOn(liveData, 'getLiveData')
    .mockImplementationOnce((site: Site, props: boolean) =>
      Promise.resolve(getMockLiveData(site.id)),
    );
};

export const mockGetMMM = () => {
  jest
    .spyOn(temperatureUtils, 'getMMM')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .mockImplementationOnce((long: number, lat: number) =>
      Promise.resolve(undefined),
    );
};
