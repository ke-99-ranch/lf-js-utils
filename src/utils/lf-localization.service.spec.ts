import { LfLocalizationService } from './lf-localization.service.js';
require('isomorphic-fetch');

describe('LfLocalizationService', () => {
  let lfLocalizationService: LfLocalizationService;

  const resourcesFolder = 'https://cdn.jsdelivr.net/npm/@laserfiche/lf-resource-library@2/resources/laserfiche-base';

  it('currentResource is undefined if language file does not exist in constructor and is not provided with initResourcesFromUrlAsync', () => {
    lfLocalizationService = new LfLocalizationService();
    expect(lfLocalizationService.currentResource).toEqual(undefined);
  });

  it('setLanguage does not set currentResource if no resources were passed in constructor and initResourcesFromUrlAsync has not been called', () => {
    lfLocalizationService = new LfLocalizationService();
    lfLocalizationService.setLanguage('fr-CA');

    expect(lfLocalizationService.currentResource).toEqual(undefined);
  });

  it('constructor should throw if provided map does not include English', () => {
    const resources = new Map([['test', { TEST_STRING: 'test string' }]]);
    const error = 'Required language resource en is not found in provided map.';

    expect(() => {
      lfLocalizationService = new LfLocalizationService(resources);
    }).toThrow(error);
  });

  it('setLanguage assigns currentResource to the default language English if specified does not exist', () => {
    const resources = new Map([
      ['test', { TEST_STRING: 'test string' }],
      ['en', { TEST_STRING: 'test string' }],
    ]);
    lfLocalizationService = new LfLocalizationService(resources);
    lfLocalizationService.setLanguage('fr-CA');

    expect(lfLocalizationService.currentResource?.language).toEqual('en');
  });

  it('setLanguage assigns specified language if specified exist', async () => {
    lfLocalizationService = new LfLocalizationService();
    lfLocalizationService.setLanguage('fr');
    await lfLocalizationService.initResourcesFromUrlAsync(resourcesFolder);

    expect(lfLocalizationService.currentResource?.language).toEqual('fr');
  });

  it('setLanguage assigns default language if specified does not exist, but default exist', async () => {
    lfLocalizationService = new LfLocalizationService();
    lfLocalizationService.setLanguage('nonexistent');
    await lfLocalizationService.initResourcesFromUrlAsync(resourcesFolder);

    expect(lfLocalizationService.currentResource?.language).toEqual('en');
  });

  it('setLanguage assigns language without area code if specified does not exist, but language without area code exists', async () => {
    lfLocalizationService = new LfLocalizationService();
    lfLocalizationService.setLanguage('fr-CA');
    await lfLocalizationService.initResourcesFromUrlAsync(resourcesFolder);

    expect(lfLocalizationService.currentResource?.language).toEqual('fr');
  });

  it('calling setLanguage after calling initResourcesFromUrlAsync should not set specified language', async () => {
    lfLocalizationService = new LfLocalizationService();
    await lfLocalizationService.initResourcesFromUrlAsync(resourcesFolder);
    lfLocalizationService.setLanguage('fr');

    expect(lfLocalizationService.currentResource?.language).toEqual('en');
  });

  it('calling setLanguage before calling initResourcesFromUrlAsync should set specified language', async () => {
    lfLocalizationService = new LfLocalizationService();
    lfLocalizationService.setLanguage('fr');
    await lfLocalizationService.initResourcesFromUrlAsync(resourcesFolder);

    expect(lfLocalizationService.currentResource?.language).toEqual('fr');
  });

  it('getString should return key when no map has been specified', () => {
    // Arrange
    lfLocalizationService = new LfLocalizationService();
    const stringKey: string = 'INVALID_FIELD_REQUIRED_FIELD_EMPTY';
    const expectedString: string = '<< INVALID_FIELD_REQUIRED_FIELD_EMPTY >>';

    // Assert
    expect(lfLocalizationService.getString(stringKey)).toEqual(expectedString);
  });

  it('getString with two parameters to be substituted', async () => {
    // Arrange
    lfLocalizationService = new LfLocalizationService();
    const stringKey: string = 'MVFG_HEADER_FORMATTER';
    const expectedValue: string = 'five of ten';

    // Act
    lfLocalizationService.setLanguage('en');
    await lfLocalizationService.initResourcesFromUrlAsync(resourcesFolder);
    const localizedString = lfLocalizationService.getString(stringKey, ['five', 'ten']);

    // Assert
    expect(localizedString).toEqual(expectedValue);
  });

  it('getString gets Spanish when spanish is specified', async () => {
    // Arrange
    lfLocalizationService = new LfLocalizationService();
    const stringKey: string = 'EMPTY_FILE_EXPLORER';
    const spanishValue: string = 'Esta carpeta está vacía.';

    // Act
    lfLocalizationService.setLanguage('es');
    await lfLocalizationService.initResourcesFromUrlAsync(resourcesFolder);
    const localizedString = lfLocalizationService.getString(stringKey);

    // Assert
    expect(localizedString).toEqual(spanishValue);
  });

  it(`getString gets pt-BR when pt-BR is specified`, async () => {
    // Arrange
    lfLocalizationService = new LfLocalizationService();
    const stringKey: string = 'EMPTY_FILE_EXPLORER';
    const spanishValue: string = 'Esta pasta está vazia.';

    // Act
    lfLocalizationService.setLanguage('pt-BR');
    await lfLocalizationService.initResourcesFromUrlAsync(resourcesFolder);
    const localizedString = lfLocalizationService.getString(stringKey);

    // Assert
    expect(localizedString).toEqual(spanishValue);
  });

  it('getString gets english when selected language does not exist', async () => {
    // Arrange
    lfLocalizationService = new LfLocalizationService();
    const stringKey: string = 'EMPTY_FILE_EXPLORER';
    const englishValue: string = 'This folder is empty.';

    // Act
    lfLocalizationService.setLanguage('nonexistent');
    await lfLocalizationService.initResourcesFromUrlAsync(resourcesFolder);

    const localizedString = lfLocalizationService.getString(stringKey);

    // Assert
    expect(localizedString).toEqual(englishValue);
  });

  it(`getString should return key when selected language map exists,
   but string does not exist in neither selected language or default language`, async () => {
    // Arrange
    lfLocalizationService = new LfLocalizationService();
    const stringKey: string = 'NON_EXISTENT_STRING';
    const notFoundValue: string = '<< NON_EXISTENT_STRING >>';

    // Act
    lfLocalizationService.setLanguage('zh-Hant');
    await lfLocalizationService.initResourcesFromUrlAsync(resourcesFolder);
    const localizedString = lfLocalizationService.getString(stringKey);

    // Assert
    expect(localizedString).toEqual(notFoundValue);
  });

  it('initResourcesFromUrlAsync should return error when getting default language returns HTTP error 404', async () => {
    // Arrange
    lfLocalizationService = new LfLocalizationService();
    const message = `Required language resource en is not found in ${resourcesFolder}nonexistent/en.json.`;

    try {
      await lfLocalizationService.initResourcesFromUrlAsync(`${resourcesFolder}nonexistent`);
    } catch (e) {
      const msg = (<Error>e).message;
      expect(msg.includes(message)).toBeTruthy();
    }
  });

  it('initResourcesFromUrlAsync should return error when getting HTTP error other than 404', async () => {
    // Arrange
    lfLocalizationService = new LfLocalizationService();
    const mockedResponse = new Response(null, { status: 500 });
    const globalFetch = global.fetch;
    global.fetch = jest.fn(() => Promise.resolve(mockedResponse));
    const resUrl = `${resourcesFolder}/en.json`;

    try {
      await lfLocalizationService.initResourcesFromUrlAsync(resourcesFolder);
    } catch (e) {
      const msg = (<Error>e).message;
      expect(msg.includes('500')).toBeTruthy();
      expect(msg.includes(resUrl)).toBeTruthy();
    } finally {
      global.fetch = globalFetch;
    }
  });

  it('should be able to set custom json', () => {
    const resources: Map<string, object> = new Map([
      ['en', { TEST_STRING: 'test res' }],
      ['es', { TEST_STRING: 'prueba' }],
    ]);
    lfLocalizationService = new LfLocalizationService(resources);

    let localizedString = lfLocalizationService.getString('TEST_STRING');
    expect(localizedString).toEqual('test res');

    lfLocalizationService.setLanguage('es');
    localizedString = lfLocalizationService.getString('TEST_STRING');
    expect(localizedString).toEqual('prueba');
  });

  it('should be able to set custom json, default to English if translation does not exist', () => {
    const resources: Map<string, object> = new Map([
      ['en', { TEST_STRING: 'test res' }],
      ['es', { TEST_STRING: 'prueba' }],
    ]);
    lfLocalizationService = new LfLocalizationService(resources);

    let localizedString = lfLocalizationService.getString('TEST_STRING');
    expect(localizedString).toEqual('test res');

    lfLocalizationService.setLanguage('ar');
    localizedString = lfLocalizationService.getString('TEST_STRING');
    expect(localizedString).toEqual('test res');
  });

  it('should be able to set custom json, fr-CA will default to fr if fr-CA does not exist', () => {
    const resources: Map<string, object> = new Map([
      ['en', { TEST_STRING: 'test res' }],
      ['fr', { TEST_STRING: 'french test' }],
    ]);
    lfLocalizationService = new LfLocalizationService(resources);

    let localizedString = lfLocalizationService.getString('TEST_STRING');
    expect(localizedString).toEqual('test res');

    lfLocalizationService.setLanguage('fr-CA');
    localizedString = lfLocalizationService.getString('TEST_STRING');
    expect(localizedString).toEqual('french test');
  });

  it('should be able to set custom json, fr-CA should use fr-CA if exists', () => {
    const resources: Map<string, object> = new Map([
      ['en', { TEST_STRING: 'test res' }],
      ['fr', { TEST_STRING: 'french test' }],
      ['fr-CA', { TEST_STRING: 'french CA test' }],
    ]);
    lfLocalizationService = new LfLocalizationService(resources);

    let localizedString = lfLocalizationService.getString('TEST_STRING');
    expect(localizedString).toEqual('test res');

    lfLocalizationService.setLanguage('fr');
    localizedString = lfLocalizationService.getString('TEST_STRING');
    expect(localizedString).toEqual('french test');

    lfLocalizationService.setLanguage('fr-CA');
    localizedString = lfLocalizationService.getString('TEST_STRING');
    expect(localizedString).toEqual('french CA test');
  });

  it('should be able to set custom json, fr-CA will default to en if no fr-CA or no fr', () => {
    const resources: Map<string, object> = new Map([
      ['en', { TEST_STRING: 'test res' }],
      ['es', { TEST_STRING: 'prueba' }],
    ]);
    lfLocalizationService = new LfLocalizationService(resources);

    let localizedString = lfLocalizationService.getString('TEST_STRING');
    expect(localizedString).toEqual('test res');

    lfLocalizationService.setLanguage('fr-CA');
    localizedString = lfLocalizationService.getString('TEST_STRING');
    expect(localizedString).toEqual('test res');
  });

  it('should create pseudo language in debug mode for english', async () => {
    lfLocalizationService = new LfLocalizationService();
    lfLocalizationService.debugMode = true;
    await lfLocalizationService.initResourcesFromUrlAsync(resourcesFolder);

    expect(lfLocalizationService.getString('APPLY_CHANGES')).toEqual('_Ḓǿ ẏǿŭ ẇȧƞŧ ŧǿ ȧƥƥŀẏ ẏǿŭř ƒīḗŀḓ ƈħȧƞɠḗş?_');
  });

  it('should create pseudo language in debug mode for spanish', async () => {
    lfLocalizationService = new LfLocalizationService();
    lfLocalizationService.debugMode = true;
    lfLocalizationService.setLanguage('es');

    await lfLocalizationService.initResourcesFromUrlAsync(resourcesFolder);

    expect(lfLocalizationService.getString('APPLY_CHANGES')).toEqual('_¿Ḓḗşḗȧ ȧƥŀīƈȧř şŭş ƈȧḿƀīǿş ḓḗ ƈȧḿƥǿ?_');
  });
});
