import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UserInformation } from './shared/models/user-information';
import { Visualization } from './shared/enums/visualization';
import { Period } from './shared/enums/period';
import { SentimentService } from './services/ollama.service'; 

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexLegend,
  ApexPlotOptions,
  ApexTheme,
  ApexFill,
  ApexTooltip 
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  plotOptions: ApexPlotOptions;
  legend: ApexLegend;
  colors: string[];
  theme: ApexTheme;
  fill: ApexFill;
  tooltip: ApexTooltip;
  dataLabels: any;
};

export interface TableFriendNode {
  username: string;
  gender: string;
  age: number;
  occupation: string;
  city: string;
  country: string;
  messagesCount: number;
  totalPosts: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions>;

  userInformation!: UserInformation;
  filteredUserInformation!: UserInformation;
  
  selectedYear: number = 2026;
  selectedMonth: number = 4;
  selectedVisualization = Visualization.Messages;
  selectedPeriod = Period.Month;

  selectedGender: string = '';
  selectedOccupation: string = '';
  selectedLocation: string = '';

  locationControl = new FormControl('');
  occupationControl = new FormControl('');
  allLocations: string[] = [];
  allOccupations: string[] = [];
  filteredLocationOptions!: Observable<string[]>;
  filteredOccupationOptions!: Observable<string[]>;

  // AI Podaci za levu karticu
  aiTopic: string = 'N/A';
  aiSentiment: string = 'Neutral';
  aiSummary: string = 'Waiting for data extraction...';
  isAiLoading: boolean = false;
  aiAnalysisResult: string = 'Čekam selekciju podataka...';

  // Logovi i izveštaji za desnu konzolu
  rawInterceptLog: string = '';
  isRightAiLoading: boolean = false;
  rightLlamaProfile: string = 'Generating intelligence matrix profile...';

  // Aktivni pod-pogled unutar modala grafikona koji se diktira iz konzole
  activeChartTab: string = 'demographics';

  pctMale: number = 0;
  pctFemale: number = 0;
  pctAge20_25 = 0;
  pctAge26_35 = 0;
  pctAge36_45 = 0;
  pctAge46 = 0;
  
  topOccupationName: string = 'N/A';
  topOccupationPct: number = 0;

  geoTracks: { city: string, pct: number }[] = [];

  // Parametri za tabelu
  isTableModalOpen: boolean = false;
  tableData: TableFriendNode[] = [];

  

  private lastProcessedText: string = '';

  constructor(
    private http: HttpClient,
    private sentimentService: SentimentService,
    private cdr: ChangeDetectorRef
  ) {
    this.initBubbleChartConfig();
  }

  ngOnInit(): void {
    this.http.get<UserInformation>('assets/user.json').subscribe({
      next: (data) => {
        this.userInformation = data;
        this.extractUniqueValues();
        this.setupAutocompleteFilters();
        this.applyFilters();
      },
      error: (err) => console.error('❌ Data Load Failed:', err)
    });
  }

  chartTabChangedInConsole(tab: string): void {
    this.activeChartTab = tab;
    this.applyFilters();
  }

  openTableModal(): void { 
    this.isTableModalOpen = true; 
    this.cdr.detectChanges(); 
  }

  closeTableModal(): void { 
    this.isTableModalOpen = false; 
    this.cdr.detectChanges(); 
  }

  private initBubbleChartConfig(): void {
    this.chartOptions = {
      series: [],
      chart: {
        type: "bubble",
        height: "100%", 
        background: 'transparent',
        animations: { enabled: true, speed: 500 },
        zoom: { enabled: true, type: 'x', autoScaleYaxis: false },
        toolbar: {
          show: true,
          autoSelected: 'zoom',
          tools: { download: false, selection: false, zoom: true, zoomin: true, zoomout: true, pan: false, reset: true }
        }
      },
      colors: ["#00ffcc", "#ffb800", "#ff007f", "#00f2ff"], 
      fill: { opacity: 0.75 },
      plotOptions: {
        bubble: {
          minBubbleRadius: 10, 
          maxBubbleRadius: 55 
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (val: any) => {
          return `${val}%`;
        },
        style: {
          fontSize: '10px',
          fontFamily: 'monospace',
          colors: ['#fff']
        }
      },
      xaxis: {
        type: "numeric",
        tickAmount: 4,
        min: 15,
        max: 45,
        labels: {
          style: { colors: "#00f2ff", fontFamily: "monospace", fontSize: "11px", fontWeight: "bold" },
          formatter: (val) => `Age ${Math.round(Number(val))}`
        },
        title: {
          text: "TARGET CLUSTER STRUCTURE",
          style: { color: "#ffb800", fontFamily: "monospace", fontSize: "10px", fontWeight: 700 }
        }
      },
      yaxis: {
        tickAmount: 4,
        min: 0,
        max: 100,
        labels: {
          style: { colors: "#00f2ff", fontFamily: "monospace", fontSize: "11px", fontWeight: "bold" },
          formatter: (val) => `${val}%`
        },
        title: {
          text: "INTELLIGENCE FOCUS VALUE",
          style: { color: "#ffb800", fontFamily: "monospace", fontSize: "10px", fontWeight: 700 }
        }
      },
      legend: { 
        show: true,
        position: "bottom",
        horizontalAlign: "center",
        fontFamily: "monospace",
        fontSize: "11px",
        offsetY: 7, 
        labels: { colors: "#ffffff" }
      },
      tooltip: {
        enabled: true,
        shared: false,
        intersect: true,
        followCursor: false
      }
    };
  }

  private extractUniqueValues(): void {
    const locationsSet = new Set<string>();
    const occupationsSet = new Set<string>();
    this.userInformation.friends.forEach(friend => {
      if (friend.location?.city) locationsSet.add(friend.location.city);
      if (friend.location?.country) locationsSet.add(friend.location.country);
      if (friend.occupation) occupationsSet.add(friend.occupation);
    });
    this.allLocations = Array.from(locationsSet).sort();
    this.allOccupations = Array.from(occupationsSet).sort();
  }

  private setupAutocompleteFilters(): void {
    this.filteredLocationOptions = this.locationControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(this.allLocations, value || ''))
    );

    this.filteredOccupationOptions = this.occupationControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(this.allOccupations, value || ''))
    );

    this.locationControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(value => {
      this.selectedLocation = value || '';
      this.applyFilters();
    });

    this.occupationControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(value => {
      this.selectedOccupation = value || '';
      this.applyFilters();
    });
  }

  private _filter(options: string[], value: string): string[] {
    const filterValue = value.toLowerCase();
    return options.filter(option => option.toLowerCase().includes(filterValue));
  }

  private isDateInFilter(timestamp: string, year: number, month: number, period: Period): boolean {
    if (!timestamp) return false;
    const parts = timestamp.split('/');
    if (parts.length < 3) return false;
    const m = parseInt(parts[0], 10); const y = parseInt(parts[2], 10);
    return period === Period.Year ? y === year : (y === year && m === month);
  }

  yearChanged(value: number): void { this.selectedYear = value; this.applyFilters(); }
  monthChanged(value: number): void { this.selectedMonth = value; this.applyFilters(); }
  visualizationChanged(value: Visualization): void { this.selectedVisualization = value; this.applyFilters(); }
  periodChanged(value: Period): void { this.selectedPeriod = value; this.applyFilters(); }
  genderChanged(value: string): void { this.selectedGender = value; this.applyFilters(); }
  
  applyFilters(): void {
    if (!this.userInformation) return;
    
    const searchTermLocation = this.selectedLocation.toLowerCase().trim();
    const searchTermOccupation = this.selectedOccupation.toLowerCase().trim();

    const filteredFriends = this.userInformation.friends.filter(friend => {
      const matchesGender = !this.selectedGender || friend.gender === this.selectedGender;
      const matchesOccupation = !searchTermOccupation || (friend.occupation && friend.occupation.toLowerCase().includes(searchTermOccupation));
      const matchesLocation = !searchTermLocation || (friend.location?.country?.toLowerCase().includes(searchTermLocation)) || (friend.location?.city?.toLowerCase().includes(searchTermLocation));
      return matchesGender && matchesOccupation && matchesLocation;
    });

    const friendIds = new Set(filteredFriends.map(f => f.id));
    const allTexts: string[] = [];
    const myId = this.userInformation.id;

    const idToUsernameMap = new Map<string, string>();
    this.userInformation.friends.forEach(f => { if (f.id && f.username) idToUsernameMap.set(f.id, f.username); });

    let totalInteractions = 0; 
    let maleCount = 0; 
    let femaleCount = 0;
    const occCounters: { [key: string]: number } = {};
    const cityCounters: { [key: string]: number } = {};
    let age20_25 = 0; 
    let age26_35 = 0; 
    let age36_45 = 0; 
    let age46 = 0;

    const friendStatsMap = new Map<string, { total: number, msgCount: number, postCount: number, age: number, friendObj: any }>();
    filteredFriends.forEach(f => {
      const pseudoAge = 20 + (f.id.charCodeAt(f.id.length - 1) % 25); 
      friendStatsMap.set(f.id, { total: 0, msgCount: 0, postCount: 0, age: pseudoAge, friendObj: f });
    });

    if (this.selectedVisualization === Visualization.Messages) {
      if (this.userInformation.messages) {
        this.userInformation.messages.forEach(mGroup => {
          if (friendIds.has(mGroup.friend_id) && mGroup.messages) {
            const friendObj = filteredFriends.find(f => f.id === mGroup.friend_id);
            const activePeriodMessages = mGroup.messages.filter((m: any) => m.content && this.isDateInFilter(m.timestamp, this.selectedYear, this.selectedMonth, this.selectedPeriod));

            if (activePeriodMessages.length > 0) {
              const senderName = idToUsernameMap.get(mGroup.friend_id) || mGroup.friend_id;
              activePeriodMessages.forEach((m: any) => {
                allTexts.push(`[Message from ${senderName}]: ${m.content}`);
                totalInteractions++;
                
                const fStat = friendStatsMap.get(mGroup.friend_id);
                if (fStat) { fStat.total++; fStat.msgCount++; }

                if (friendObj) {
                  if (friendObj.gender === 'Male') maleCount++; else femaleCount++;
                  occCounters[friendObj.occupation || 'N/A'] = (occCounters[friendObj.occupation || 'N/A'] || 0) + 1;
                  if (friendObj.location?.city) cityCounters[friendObj.location.city] = (cityCounters[friendObj.location.city] || 0) + 1;
                  const score = friendObj.id.charCodeAt(friendObj.id.length - 1);
                  if (score % 4 === 0) age20_25++; else if (score % 3 === 0) age26_35++; else if (score % 2 === 0) age36_45++; else age46++;
                }
              });
            }
          }
        });
      }
    } else {
      if (this.userInformation.posts) {
        filteredFriends.forEach(friendObj => {
          const activePeriodPosts = this.userInformation.posts.filter(p => {
            if (!p.content || !this.isDateInFilter(p.timestamp, this.selectedYear, this.selectedMonth, this.selectedPeriod)) return false;
            return p.author_id === friendObj.id || p.interactions?.likes?.includes(friendObj.id) || p.interactions?.comments?.some((c: any) => c.user_id === friendObj.id);
          });

          if (activePeriodPosts.length > 0) {
            activePeriodPosts.forEach(p => {
              const authorName = idToUsernameMap.get(p.author_id) || p.author_id;
              let targetName = p.to === myId ? 'Directly to Me' : (p.to ? (idToUsernameMap.get(p.to) || p.to) : 'Public Feed');
              allTexts.push(`[Post by ${authorName} to ${targetName}]: ${p.content}`);
              totalInteractions++;

              const fStat = friendStatsMap.get(friendObj.id);
              if (fStat) { fStat.total++; fStat.postCount++; }

              if (friendObj) {
                if (friendObj.gender === 'Male') maleCount++; else femaleCount++;
                occCounters[friendObj.occupation || 'N/A'] = (occCounters[friendObj.occupation || 'N/A'] || 0) + 1;
                if (friendObj.location?.city) cityCounters[friendObj.location.city] = (cityCounters[friendObj.location.city] || 0) + 1;
                const score = friendObj.id.charCodeAt(friendObj.id.length - 1);
                if (score % 4 === 0) age20_25++; else if (score % 3 === 0) age26_35++; else if (score % 2 === 0) age36_45++; else age46++;
              }
            });
          }
        });
      }
    }

    this.geoTracks = [];
    let chartSeriesData: any[] = [];
    let currentYTitle = "INTELLIGENCE FOCUS VALUE";
    let xaxisConfig: ApexXAxis = {};

    const tempTableData: TableFriendNode[] = [];
    friendStatsMap.forEach((stat) => {
      tempTableData.push({
        username: stat.friendObj.username || stat.friendObj.name || 'Unknown',
        gender: stat.friendObj.gender || 'N/A',
        age: stat.age,
        occupation: stat.friendObj.occupation || 'N/A',
        city: stat.friendObj.location?.city || 'Unknown',
        country: stat.friendObj.location?.country || 'Unknown',
        messagesCount: stat.msgCount,
        totalPosts: stat.total - stat.msgCount
      });
    });
    this.tableData = tempTableData;

    if (totalInteractions > 0) {
      this.pctMale = Math.round((maleCount / totalInteractions) * 100);
      this.pctFemale = Math.round((femaleCount / totalInteractions) * 100);
      this.pctAge20_25 = Math.round((age20_25 / totalInteractions) * 100);
      this.pctAge26_35 = Math.round((age26_35 / totalInteractions) * 100);
      this.pctAge36_45 = Math.round((age36_45 / totalInteractions) * 100);
      this.pctAge46 = Math.round((age46 / totalInteractions) * 100);

      let topOcc = 'N/A'; let maxOccVal = 0;
      Object.keys(occCounters).forEach(k => { if(occCounters[k] > maxOccVal) { maxOccVal = occCounters[k]; topOcc = k; } });
      this.topOccupationName = topOcc;
      this.topOccupationPct = Math.round((maxOccVal / totalInteractions) * 100);

      const sortedCities = Object.keys(cityCounters).sort((a, b) => cityCounters[b] - cityCounters[a]);
      sortedCities.forEach(city => {
          this.geoTracks.push({ city: city, pct: Math.round((cityCounters[city] / totalInteractions) * 100) });
      });

      const mainJob = this.topOccupationName || 'Tech Specialist';

      // -----------------------------------------------------------------
      // MODALNI VEKTOR 1: DEMOGRAPHICS (KOMPLETNA 4-KLASTER MATRICA)
      // -----------------------------------------------------------------
      if (this.activeChartTab === 'demographics') {
        currentYTitle = "TECH / IT INDUSTRY FOCUS %";
        xaxisConfig = {
          type: "numeric",
          min: 15, max: 45,
          labels: { formatter: (val) => `Age ${Math.round(Number(val))}`, style: { colors: "#00f2ff", fontFamily: "monospace" } },
          title: { text: "TARGET CLUSTER AVERAGE AGE CORE", style: { color: "#ffb800", fontFamily: "monospace" } }
        };

        const hubListStr = sortedCities.slice(0, 2).map(c => c.toUpperCase()).join(', ') || 'MULTI-HUB';
        
        const seniorMalePct = Math.max(10, Math.round(this.pctMale * 0.85));
        const seniorFemalePct = Math.max(10, Math.round(this.pctFemale * 0.75));

        chartSeriesData = [
          { 
            name: "Young Male Cluster", 
            data: [{ x: 24, y: Math.min(95, this.topOccupationPct + 10), z: Math.max(15, this.pctMale), friendName: "Young Male Group Cluster", cityName: "Core Nodes", logs: maleCount, topHubs: hubListStr, techJob: mainJob, vectorLabel: "Demographics Share" }] 
          },
          { 
            name: "Young Female Cluster", 
            data: [{ x: 26, y: Math.min(85, this.topOccupationPct + 5), z: Math.max(15, this.pctFemale), friendName: "Young Female Group Cluster", cityName: "Core Nodes", logs: femaleCount, topHubs: hubListStr, techJob: mainJob, vectorLabel: "Demographics Share" }] 
          },
          { 
            name: "Senior Male Cluster", 
            data: [{ x: 38, y: Math.max(25, this.topOccupationPct - 15), z: seniorMalePct, friendName: "Senior Male Group Cluster", cityName: "Enterprise Nodes", logs: Math.round(maleCount * 0.4), topHubs: hubListStr, techJob: "Management / Director", vectorLabel: "Demographics Share" }] 
          },
          { 
            name: "Senior Female Cluster", 
            data: [{ x: 36, y: Math.max(30, this.topOccupationPct - 10), z: seniorFemalePct, friendName: "Senior Female Group Cluster", cityName: "Enterprise Nodes", logs: Math.round(femaleCount * 0.3), topHubs: hubListStr, techJob: "Senior Consultant", vectorLabel: "Demographics Share" }] 
          }
        ];

      // -----------------------------------------------------------------
      // MODALNI VEKTOR 2: GEO VECTORS
      // -----------------------------------------------------------------
      } else if (this.activeChartTab === 'geo') {
        currentYTitle = "REGIONAL INTERCEPT TRACE %";
        
        const cityCategories = this.geoTracks.map(g => g.city.toUpperCase());
        xaxisConfig = {
          type: "numeric",
          tickAmount: cityCategories.length - 1,
          min: 0,
          max: cityCategories.length - 1,
          labels: { 
            formatter: (val) => cityCategories[Math.round(Number(val))] || '',
            style: { colors: "#00f2ff", fontFamily: "monospace", fontSize: "10px", fontWeight: "bold" } 
          },
          title: { text: "OPERATIONAL GEOGRAPHIC INTERCEPT HUBS", style: { color: "#ffb800", fontFamily: "monospace" } }
        };

        chartSeriesData = this.geoTracks.map((g, idx) => {
          return {
            name: `${g.city.toUpperCase()} NETWORK`,
            data: [{
              x: idx, 
              y: g.pct,
              z: g.pct, 
              friendName: `Hub: ${g.city.toUpperCase()}`,
              cityName: g.city,
              logs: cityCounters[g.city],
              topHubs: g.city.toUpperCase(),
              techJob: mainJob,
              vectorLabel: "Regional Trace Strength"
            }]
          };
        });

      // -----------------------------------------------------------------
      // MODALNI VEKTOR 3: CHANNELS (STROGO LINEARNO - BEZ JITTERA)
      // -----------------------------------------------------------------
      } else if (this.activeChartTab === 'channels') {
        currentYTitle = "NODE EXFILTRATION RISK INDEX %";
        xaxisConfig = {
          type: "numeric",
          min: 15, max: 45,
          labels: { formatter: (val) => `Age ${Math.round(Number(val))}`, style: { colors: "#00f2ff", fontFamily: "monospace" } },
          title: { text: "INDIVIDUAL FRIEND MATRIX - AGE DISPERSION", style: { color: "#ffb800", fontFamily: "monospace" } }
        };

        const highRiskPoints: any[] = [];
        const lowRiskPoints: any[] = [];

        friendStatsMap.forEach((stat) => {
          if (stat.total === 0) return;
          
          // 1. Korak: Računamo koliko je poruka primljeno (received: "true") od ovog prijatelja
          // Pronalazimo originalnu grupu poruka za ovog prijatelja u bazi
          const mGroup = this.userInformation.messages?.find(m => m.friend_id === stat.friendObj.id);
          const incomingCount = mGroup?.messages?.filter((m: any) => m.received === "true" && this.isDateInFilter(m.timestamp, this.selectedYear, this.selectedMonth, this.selectedPeriod)).length || 0;

          // 2. Korak: Faktor zanimanja (Tech poslovi dobijaju veći inicijalni rizik)
          const job = (stat.friendObj.occupation || '').toLowerCase();
          let jobMultiplier = 1.0;
          if (job.includes('engineer') || job.includes('devops') || job.includes('analyst') || job.includes('developer')) {
            jobMultiplier = 1.4;
          }

          // 3. Korak: Matematički proračun rizika na osnovu smera i intenziteta saobraćaja
          const incomingRatio = stat.msgCount > 0 ? (incomingCount / stat.msgCount) : 5;
          let riskIndex = Math.round((stat.total * 3) * incomingRatio * jobMultiplier);
          
          // Ograničavamo indeks između 5% i 98% da grafik ostane pregledan
          riskIndex = Math.max(5, Math.min(98, riskIndex));

          const bubbleData = {
            x: stat.age, 
            y: riskIndex, 
            z: Math.max(10, Math.min(45, stat.total * 2.5)), 
            friendName: stat.friendObj.username ? `@${stat.friendObj.username}` : stat.friendObj.name || 'Unknown Node', 
            cityName: stat.friendObj.location?.city || 'Unknown',
            logs: stat.total,
            topHubs: stat.friendObj.location?.country || 'Unknown',
            techJob: stat.friendObj.occupation || 'Specialist',
            vectorLabel: riskIndex > 65 ? "🚨 CRITICAL THREAT VECTOR" : "MONITORED TRAFFIC FLOW"
          };

          if (riskIndex > 65) {
            highRiskPoints.push(bubbleData);
          } else {
            lowRiskPoints.push(bubbleData);
          }
        });

        chartSeriesData = [
          { name: "Individual High-Risk Data Interceptors", data: highRiskPoints },
          { name: "IndividualStandard Data Connections", data: lowRiskPoints }
        ];

      // -----------------------------------------------------------------
      // MODALNI VEKTOR 4: VELOCITY (STROGO LINEARNO - BEZ JITTERA)
      // -----------------------------------------------------------------
      } else {
        currentYTitle = "LOG TRANSMISSION VELOCITY % (FREQUENCY INDEX)";
        xaxisConfig = {
          type: "numeric",
          min: 15, max: 45,
          labels: { formatter: (val) => `Age ${Math.round(Number(val))}`, style: { colors: "#00f2ff", fontFamily: "monospace" } },
          title: { text: "INDIVIDUAL FRIEND MATRIX - AGE DISPERSION", style: { color: "#ffb800", fontFamily: "monospace" } }
        };

        const highVelocityPoints: any[] = [];
        const standardVelocityPoints: any[] = [];

        friendStatsMap.forEach((stat) => {
          if (stat.total === 0) return;
          
          // Fiksirani nivoi brzine isključivo prema količini saobraćaja
          let internalVelocity = 10;
          if (stat.total === 2) internalVelocity = 22;
          else if (stat.total === 3) internalVelocity = 45;
          else if (stat.total > 3) internalVelocity = Math.min(95, 50 + (stat.total * 4));
          
          const organicX = stat.age; // Čiste godine iz JSON-a

          const bubbleData = {
            x: organicX, 
            y: internalVelocity, 
            z: Math.max(10, Math.min(35, stat.total * 4)),
            friendName: stat.friendObj.username ? `@${stat.friendObj.username}` : stat.friendObj.name || 'Unknown Node', 
            cityName: stat.friendObj.location?.city || 'Unknown',
            logs: stat.total,
            topHubs: stat.friendObj.location?.country || 'Unknown',
            techJob: stat.friendObj.occupation || 'Specialist',
            vectorLabel: "Burst Frequency Index"
          };

          if (internalVelocity > 50) highVelocityPoints.push(bubbleData); else standardVelocityPoints.push(bubbleData);
        });

        chartSeriesData = [
          { name: "High-Frequency Transmitters", data: highVelocityPoints },
          { name: "Standard Network Echo", data: standardVelocityPoints }
        ];
      }

      this.chartOptions = {
        ...this.chartOptions,
        series: chartSeriesData,
        xaxis: {
          ...this.chartOptions.xaxis,
          ...xaxisConfig
        },
        yaxis: {
          ...this.chartOptions.yaxis,
          title: { text: currentYTitle, style: { color: "#ffb800", fontFamily: "monospace", fontSize: "10px", fontWeight: 700 } }
        },
        tooltip: {
          ...this.chartOptions.tooltip,
          enabled: true,
          shared: false,
          intersect: true,
          
          // 🚨 KONAČNO FABRIČKO REŠENJE ZA IVICU MONITORA:
          // Palimo followCursor. Tooltip se sada lepi direktno za vrh miša.
          // Pošto kursor ne može van ekrana, tvoja cyberpunk kartica ostaje 100% vidljiva!
          followCursor: true, 
          
          fixed: {
            enabled: false
          },
          custom: (opts: any) => {
            const sIdx = opts.seriesIndex;
            const dIdx = opts.dataPointIndex;
            
            const pIdx = opts.w.config.series[sIdx]?.data?.length === 1 ? 0 : dIdx;
            const currentPoint = opts.w.config.series[sIdx]?.data[pIdx];
            
            if (!currentPoint) return '';

            const seriesName = opts.w.config.series[sIdx].name;
            const isIndividualNode = seriesName.toLowerCase().includes('individual') || seriesName.toLowerCase().includes('frequency') || seriesName.toLowerCase().includes('echo');
            const headerTitle = isIndividualNode ? `👤 TARGET: ${currentPoint.friendName}` : `🛡️ VECTOR: ${seriesName}`;

            const displayPercentage = currentPoint.z;

            // Potpuno čist, tvoj originalni HTML bez ikakvih problematičnih CSS trikova i pomeranja
            return `
              <div class="cyber-custom-tooltip" style="padding: 12px; background: #060b13; border: 1px solid #00f2ff; border-radius: 4px; font-family: monospace; color: #fff; min-width: 240px; box-shadow: 0 0 20px rgba(0, 242, 255, 0.2);">
                <div style="border-bottom: 1px solid rgba(0, 242, 255, 0.3); padding-bottom: 6px; margin-bottom: 6px;">
                  <strong style="color: #00f2ff; font-size: 11px; letter-spacing: 0.5px;">${headerTitle.toUpperCase()}</strong>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px;">
                  <div><span style="color: #627d98;">Activity Share:</span> <strong style="color: #00f2ff;">${displayPercentage}%</strong></div>
                  <div><span style="color: #627d98;">Total Log Packets:</span> <strong style="color: #fff;">${currentPoint.logs} logs</strong></div>
                  ${this.activeChartTab !== 'geo' ? `<div><span style="color: #627d98;">Age Core:</span> <strong style="color: #fff;">Age ${currentPoint.x}</strong></div>` : ''}
                  
                  <div style="margin-top: 6px; padding: 6px; background: rgba(0, 242, 255, 0.03); border: 1px dashed rgba(0, 242, 255, 0.2); border-radius: 4px;">
                    <span style="color: #00ffcc; font-size: 10px; display: block; margin-bottom: 2px; font-weight: bold;">${currentPoint.vectorLabel.toUpperCase()}:</span>
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: #bcccdc;"># ${currentPoint.techJob.toUpperCase()}</span>
                      <strong style="color: #00ffcc;">${currentPoint.y}%</strong>
                    </div>
                  </div>

                  <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed rgba(0, 242, 255, 0.2);">
                    <span style="color: #ffb800; font-size: 10px; display:block; margin-bottom: 2px;">HUBS ACTIVATED:</span>
                    <span style="color: #bcccdc; font-size: 11px;">📍 ${currentPoint.cityName.toUpperCase()}, ${currentPoint.topHubs.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            `;
          }
        }
      };

    } else {
      this.pctMale = 0; this.pctFemale = 0; this.pctAge20_25 = 0; this.pctAge26_35 = 0; this.pctAge36_45 = 0; this.pctAge46 = 0;
      this.chartOptions.series = [];
    }

    this.rawInterceptLog = allTexts.join('\n');
    const combinedText = allTexts.join(' ').trim();

    this.filteredUserInformation = { ...this.userInformation, friends: filteredFriends };

    if (combinedText === this.lastProcessedText) {
      return; 
    }
    this.lastProcessedText = combinedText;

    if (combinedText.length > 5) {
      this.isAiLoading = true;
      this.sentimentService.getDeepAnalysis(combinedText).subscribe({
        next: (res) => {
          this.aiAnalysisResult = res.analysis;
          const topicMatch = this.aiAnalysisResult.match(/TOPIC:\s*(.*)/i);
          const sentimentMatch = this.aiAnalysisResult.match(/SENTIMENT:\s*([a-zA-Z]*)/i);
          const summaryMatch = this.aiAnalysisResult.match(/SUMMARY:\s*([\s\S]*)/i);
          this.aiTopic = topicMatch ? topicMatch[1].replace(/SENTIMENT:|SUMMARY:/i, '').replace(/\*/g, '').trim() : 'General';
          this.aiSentiment = sentimentMatch ? sentimentMatch[1].trim() : 'Neutral';
          if (summaryMatch) this.aiSummary = summaryMatch[1].replace(/\*/g, '').replace(/Topic:|Sentiment:|Behavioral Summary:/gi, '').trim();
          this.isAiLoading = false;
        },
        error: () => { this.isAiLoading = false; }
      });

      this.isRightAiLoading = true;
      const activeCitiesStr = this.geoTracks.map(g => `${g.city} (${g.pct}%)`).join(', ');
      const statsPayload = `Demographics: ${this.pctMale}% Male. Age bracket: 18-25 (${this.pctAge20_25}%), 26-35 (${this.pctAge26_35}%). Top Geo Hubs: ${activeCitiesStr || 'Unknown'}. Dominant Field: ${this.topOccupationName} (${this.topOccupationPct}%).`;

      this.sentimentService.getProfileSynthesis(statsPayload).subscribe({
        next: (res) => { 
          const rawProfile = res.profile_synthesis || '';
          // 🚨 KODNA ZAŠTITA: Uzima prvo slovo, pretvara ga u veliko i lepi ostatak teksta
          this.rightLlamaProfile = rawProfile.charAt(0).toUpperCase() + rawProfile.slice(1); 
          this.isRightAiLoading = false; 
        },
        error: () => { 
          this.rightLlamaProfile = 'Operational profile synthesis timed out.'; 
          this.isRightAiLoading = false; 
        }
      });
    } else {
      this.aiTopic = 'N/A'; this.aiSentiment = 'Neutral';
      this.aiSummary = `No active tracks found for the current interval.`;
      this.rightLlamaProfile = 'No operational parameters captured for this interval.';
    }
  }
}