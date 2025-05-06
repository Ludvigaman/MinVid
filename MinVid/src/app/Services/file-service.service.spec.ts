import { TestBed } from '@angular/core/testing';

import { FileServiceService } from './file-service.service';

describe('FileServiceService', () => {
  let service: FileServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
