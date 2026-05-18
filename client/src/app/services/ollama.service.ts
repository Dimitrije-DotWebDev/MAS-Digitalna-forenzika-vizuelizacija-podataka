import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class SentimentService {
  private pythonUrl = 'http://localhost:8000/analyze';

  constructor(private http: HttpClient) {}

  getDeepAnalysis(text: string) {
    return this.http.post<any>(this.pythonUrl, { text });
  }

  getProfileSynthesis(metadataText: string) {
    // Proveri da li šalješ objekat sa ključem 'metadata_text' jer ga FastAPI tako očekuje u klasi ProfileAnalysisRequest
    return this.http.post<any>('http://localhost:8000/analyze-profile', { metadata_text: metadataText });
  }
}