import type { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface VehiclesTable {
  id: Generated<number>;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  fuel_type: string;
  mpg_city: number | null;
  mpg_highway: number | null;
  mpg_combined: number | null;
  kwh_per_100mi: number | null;
  epa_vehicle_id: string | null;
  nhtsa_vehicle_id: string | null;
  body_style: string | null;
  cargo_volume_cuft: number | null;
  passenger_capacity: number | null;
  msrp_original: number | null;
  nhtsa_overall_safety_rating: number | null;
  nhtsa_complaint_count: number | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface GigVehicleScoresTable {
  id: Generated<number>;
  vehicle_id: number;
  gig_category: string;
  overall_score: number;
  cost_score: number;
  comfort_score: number;
  cargo_score: number;
  reliability_score: number;
  computed_at: Generated<Date>;
}

export interface MaintenanceSchedulesTable {
  id: Generated<number>;
  vehicle_id: number;
  service_type: string;
  interval_miles: number | null;
  interval_months: number | null;
  estimated_cost_low: number | null;
  estimated_cost_high: number | null;
  source: string;
}

export interface UsersTable {
  id: Generated<number>;
  email: string;
  password_hash: string;
  display_name: string | null;
  gig_platforms: string[] | null;
  zip_code: string | null;
  tier: string;
  joined_at: Generated<Date>;
  last_active_at: Date | null;
}

export interface UserVehiclesTable {
  id: Generated<number>;
  user_id: number;
  vehicle_id: number;
  nickname: string | null;
  purchase_price: number | null;
  purchase_date: Date | null;
  purchase_mileage: number | null;
  current_mileage: number | null;
  monthly_insurance_cents: number | null;
  monthly_payment_cents: number | null;
  is_primary: boolean;
  created_at: Generated<Date>;
}

export interface ExpenseLogsTable {
  id: Generated<number>;
  user_vehicle_id: number;
  category: string;
  subcategory: string | null;
  amount_cents: number;
  odometer_reading: number | null;
  date: Date;
  notes: string | null;
  gallons: number | null;
  price_per_gallon_cents: number | null;
  station_name: string | null;
  is_business_expense: boolean;
  created_at: Generated<Date>;
}

export interface MileageLogsTable {
  id: Generated<number>;
  user_vehicle_id: number;
  date: Date;
  start_odometer: number | null;
  end_odometer: number | null;
  miles: number;
  purpose: string;
  gig_platform: string | null;
  notes: string | null;
  created_at: Generated<Date>;
}

export interface EarningsImportsTable {
  id: Generated<number>;
  user_id: number;
  platform: string;
  import_method: string;
  period_start: Date | null;
  period_end: Date | null;
  gross_earnings_cents: number;
  tips_cents: number;
  bonuses_cents: number;
  trips_count: number | null;
  online_hours: number | null;
  imported_at: Generated<Date>;
}

export interface CommunityRepairReportsTable {
  id: Generated<number>;
  user_id: number;
  vehicle_id: number;
  service_type: string;
  amount_cents: number;
  mileage_at_service: number | null;
  shop_type: string | null;
  zip_code: string | null;
  description: string | null;
  is_verified: Generated<boolean>;
  upvotes: Generated<number>;
  downvotes: Generated<number>;
  created_at: Generated<Date>;
}

export interface CommunityRepairAggregatesTable {
  id: Generated<number>;
  vehicle_id: number;
  service_type: string;
  avg_cost_cents: number | null;
  median_cost_cents: number | null;
  min_cost_cents: number | null;
  max_cost_cents: number | null;
  report_count: number | null;
  confidence_level: string | null;
  computed_at: Generated<Date>;
}

export interface CommunityTipsTable {
  id: Generated<number>;
  user_id: number;
  vehicle_make: string | null;
  vehicle_model: string | null;
  gig_platform: string | null;
  title: string;
  body: string;
  upvotes: Generated<number>;
  downvotes: Generated<number>;
  created_at: Generated<Date>;
}

export interface RepairReportVotesTable {
  user_id: number;
  report_id: number;
  vote: number;
}

export interface TipVotesTable {
  user_id: number;
  tip_id: number;
  vote: number;
}

export interface UserBadgesTable {
  id: Generated<number>;
  user_id: number;
  badge_type: string;
  earned_at: Generated<Date>;
}

export interface UserStatsTable {
  user_id: number;
  total_repair_reports: Generated<number>;
  total_tips: Generated<number>;
  total_upvotes_received: Generated<number>;
  current_streak_days: Generated<number>;
  longest_streak_days: Generated<number>;
  last_contribution_date: Date | null;
  reputation_score: Generated<number>;
}

export interface CommunityGasPricesTable {
  id: Generated<number>;
  user_id: number | null;
  station_name: string;
  brand: string | null;
  address: string | null;
  zip_code: string;
  latitude: number | null;
  longitude: number | null;
  regular_cents: number | null;
  midgrade_cents: number | null;
  premium_cents: number | null;
  diesel_cents: number | null;
  reported_at: Generated<Date>;
}

export interface AffiliateLinksTable {
  id: Generated<number>;
  category: string;
  provider: string;
  display_name: string;
  base_url: string;
  affiliate_code: string | null;
  description: string | null;
  vehicle_make: string | null;
  is_active: Generated<boolean>;
  created_at: Generated<Date>;
}

export interface AffiliateClicksTable {
  id: Generated<number>;
  affiliate_link_id: number | null;
  user_id: number | null;
  context_vehicle_id: number | null;
  clicked_at: Generated<Date>;
}

export interface SubscriptionsTable {
  id: Generated<number>;
  user_id: number;
  tier: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  started_at: Generated<Date>;
  expires_at: Date | null;
  is_active: Generated<boolean>;
}

export interface EarningsBenchmarksTable {
  id: Generated<number>;
  zip_prefix: string;
  platform: string;
  period_type: string;
  avg_gross_hourly_cents: number | null;
  median_gross_hourly_cents: number | null;
  p25_gross_hourly_cents: number | null;
  p75_gross_hourly_cents: number | null;
  avg_tips_pct: number | null;
  avg_platform_fee_pct: number | null;
  avg_trips_per_hour: number | null;
  sample_size: number;
  computed_at: Generated<Date>;
}

export interface PlatformFeeReportsTable {
  id: Generated<number>;
  user_id: number;
  platform: string;
  trip_date: Date;
  rider_paid_cents: number;
  driver_received_cents: number;
  tip_cents: Generated<number>;
  surge_multiplier: Generated<number>;
  trip_distance_miles: number | null;
  trip_duration_minutes: number | null;
  zip_code: string | null;
  created_at: Generated<Date>;
}

export interface MarketComparisonsTable {
  id: Generated<number>;
  zip_prefix: string;
  best_platform: string | null;
  best_hourly_cents: number | null;
  worst_platform: string | null;
  worst_hourly_cents: number | null;
  platforms_compared: Generated<number>;
  computed_at: Generated<Date>;
}

export interface ForumChannelsTable {
  id: Generated<number>;
  slug: string;
  name: string;
  description: string | null;
  channel_type: string;
  icon: string | null;
  post_count: Generated<number>;
  created_at: Generated<Date>;
}

export interface ForumPostsTable {
  id: Generated<number>;
  channel_id: number;
  user_id: number;
  title: string;
  body: string;
  upvotes: Generated<number>;
  downvotes: Generated<number>;
  reply_count: Generated<number>;
  is_pinned: Generated<boolean>;
  vehicle_make: string | null;
  vehicle_model: string | null;
  gig_platform: string | null;
  city: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface ForumRepliesTable {
  id: Generated<number>;
  post_id: number;
  user_id: number;
  parent_reply_id: number | null;
  body: string;
  upvotes: Generated<number>;
  downvotes: Generated<number>;
  created_at: Generated<Date>;
}

export interface ForumPostVotesTable {
  user_id: number;
  post_id: number;
  vote: number;
}

export interface ForumReplyVotesTable {
  user_id: number;
  reply_id: number;
  vote: number;
}

export interface DemandHeatmapDataTable {
  id: Generated<number>;
  user_id: number | null;
  zip_code: string;
  day_of_week: number;
  hour_of_day: number;
  platform: string | null;
  trips_completed: Generated<number>;
  avg_earnings_cents: number | null;
  recorded_at: Generated<Date>;
}

export interface DemandHeatmapAggregatesTable {
  id: Generated<number>;
  zip_code: string;
  day_of_week: number;
  hour_of_day: number;
  platform: string | null;
  avg_trips: number | null;
  avg_earnings_cents: number | null;
  demand_level: string | null;
  sample_size: Generated<number>;
  computed_at: Generated<Date>;
}

export interface Database {
  vehicles: VehiclesTable;
  gig_vehicle_scores: GigVehicleScoresTable;
  maintenance_schedules: MaintenanceSchedulesTable;
  users: UsersTable;
  user_vehicles: UserVehiclesTable;
  expense_logs: ExpenseLogsTable;
  mileage_logs: MileageLogsTable;
  earnings_imports: EarningsImportsTable;
  community_repair_reports: CommunityRepairReportsTable;
  community_repair_aggregates: CommunityRepairAggregatesTable;
  community_tips: CommunityTipsTable;
  repair_report_votes: RepairReportVotesTable;
  tip_votes: TipVotesTable;
  user_badges: UserBadgesTable;
  community_gas_prices: CommunityGasPricesTable;
  affiliate_links: AffiliateLinksTable;
  affiliate_clicks: AffiliateClicksTable;
  subscriptions: SubscriptionsTable;
  user_stats: UserStatsTable;
  earnings_benchmarks: EarningsBenchmarksTable;
  platform_fee_reports: PlatformFeeReportsTable;
  market_comparisons: MarketComparisonsTable;
  forum_channels: ForumChannelsTable;
  forum_posts: ForumPostsTable;
  forum_replies: ForumRepliesTable;
  forum_post_votes: ForumPostVotesTable;
  forum_reply_votes: ForumReplyVotesTable;
  demand_heatmap_data: DemandHeatmapDataTable;
  demand_heatmap_aggregates: DemandHeatmapAggregatesTable;
  driver_profiles: DriverProfilesTable;
  satisfaction_surveys: SatisfactionSurveysTable;
  satisfaction_index: SatisfactionIndexTable;
  rights_guides: RightsGuidesTable;
  deactivation_reports: DeactivationReportsTable;
  rider_waitlist: RiderWaitlistTable;
  driver_preregistration: DriverPreregistrationTable;
  driver_availability: DriverAvailabilityTable;
}

export interface RiderWaitlistTable {
  id: Generated<number>;
  email: string;
  zip_code: string | null;
  referral_source: string | null;
  signed_up_at: Generated<Date>;
}

export interface DriverPreregistrationTable {
  id: Generated<number>;
  user_id: number | null;
  email: string;
  zip_code: string | null;
  platforms_current: string[] | null;
  years_experience: number | null;
  vehicle_year: number | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  weekly_hours_available: number | null;
  preferred_schedule: string[] | null;
  interested_in: string[] | null;
  registered_at: Generated<Date>;
}

export interface DriverAvailabilityTable {
  id: Generated<number>;
  user_id: number;
  day_of_week: number;
  start_hour: number;
  end_hour: number;
  preferred_areas: string[] | null;
  gig_types: string[] | null;
  updated_at: Generated<Date>;
}

export interface DriverProfilesTable {
  id: Generated<number>;
  user_id: number;
  total_trips: Generated<number>;
  total_miles: Generated<number>;
  years_driving: Generated<number>;
  platforms_active: string[] | null;
  avg_rating: number | null;
  specialties: string[] | null;
  bio: string | null;
  is_public: Generated<boolean>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface SatisfactionSurveysTable {
  id: Generated<number>;
  user_id: number;
  platform: string;
  survey_month: Date;
  overall_satisfaction: number;
  pay_fairness: number | null;
  app_quality: number | null;
  support_quality: number | null;
  safety_feeling: number | null;
  deactivation_fear: number | null;
  would_recommend: boolean | null;
  comments: string | null;
  created_at: Generated<Date>;
}

export interface SatisfactionIndexTable {
  id: Generated<number>;
  platform: string;
  survey_month: Date;
  avg_overall: number | null;
  avg_pay_fairness: number | null;
  avg_app_quality: number | null;
  avg_support_quality: number | null;
  avg_safety: number | null;
  avg_deactivation_fear: number | null;
  recommend_pct: number | null;
  response_count: Generated<number>;
  computed_at: Generated<Date>;
}

export interface RightsGuidesTable {
  id: Generated<number>;
  slug: string;
  title: string;
  category: string;
  body: string;
  state: string | null;
  platform: string | null;
  is_published: Generated<boolean>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface DeactivationReportsTable {
  id: Generated<number>;
  user_id: number | null;
  platform: string;
  reason: string | null;
  was_appealed: Generated<boolean>;
  appeal_result: string | null;
  description: string | null;
  reported_at: Generated<Date>;
}

export type Vehicle = Selectable<VehiclesTable>;
export type NewVehicle = Insertable<VehiclesTable>;
export type VehicleUpdate = Updateable<VehiclesTable>;
export type GigVehicleScore = Selectable<GigVehicleScoresTable>;
export type User = Selectable<UsersTable>;
