import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Shield, Lock, Database, Eye, FileText, ChevronLeft } from "lucide-react";

interface PrivacyPolicyProps {
    open: boolean;
    onClose: () => void;
}

export function PrivacyPolicy({ open, onClose }: PrivacyPolicyProps) {
    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent side="bottom" className="h-[90vh] flex flex-col">
                <SheetHeader className="flex-none p-6 border-b flex items-center gap-2 relative">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-10 w-10 p-0 -ml-1 hover:bg-muted/50"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <SheetTitle className="flex items-center gap-2 text-base">
                            <Shield className="h-5 w-5 flex-shrink-0" />
                            Privacy Policy
                        </SheetTitle>
                        <SheetDescription className="text-xs">
                            How KharchaPal handles your data
                        </SheetDescription>
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1 scrollbar-thin scrollbar-thumb-primary/60 scrollbar-track-muted/50 scrollbar-thumb-rounded hover:scrollbar-thumb-primary pr-4">
                    <div className="p-6 space-y-6 [&>div]:max-w-none">
                        {/* Introduction */}
                        <section>
                            <h3 className="text-lg font-semibold mb-2">Your Privacy Matters</h3>
                            <p className="text-sm text-muted-foreground">
                                KharchaPal is designed with your privacy as a top priority. We believe your financial data
                                should remain yours and yours alone.
                            </p>
                        </section>

                        {/* Local Storage */}
                        <section className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Database className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold">100% Local Storage</h3>
                            </div>
                            <div className="bg-muted/50 border-2 border-primary/20 rounded-lg p-4 space-y-2">
                                <p className="text-sm">
                                    <strong>All your data is stored locally on your device only.</strong>
                                </p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                                    <li>Expenses and income records</li>
                                    <li>Budget information</li>
                                    <li>Debt/IOU records</li>
                                    <li>Goals and savings</li>
                                    <li>Family member information</li>
                                    <li>Receipt images and attachments</li>
                                </ul>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Your data never leaves your device. There is no cloud storage, no server uploads, and no backups to external services.
                                </p>
                            </div>
                        </section>

                        {/* No Cloud Sync */}
                        <section className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Lock className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold">No Cloud Sync</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                KharchaPal does not sync your data to any cloud service. Your financial information stays
                                on your device and is never transmitted to our servers or any third-party services.
                                <p className="text-sm text-muted-foreground italic mt-2">
                                    Optional cloud sync feature may be added in future versions (opt-in only, with explicit user consent).
                                </p>
                            </p>
                        </section>

                        {/* No Analytics */}
                        <section className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Eye className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold">No Analytics or Tracking</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                We do not collect any analytics, usage data, or tracking information. We don't know:
                            </p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                                <li>How you use the app</li>
                                <li>What features you access</li>
                                <li>How much you spend or earn</li>
                                <li>Any personal or financial information</li>
                            </ul>
                        </section>

                        {/* Data Collection */}
                        <section className="space-y-3">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold">What Data We Collect</h3>
                            </div>
                            <p className="text-sm font-medium">Short answer: Nothing.</p>
                            <p className="text-sm text-muted-foreground">
                                KharchaPal does not collect, store, or transmit any of your data. All information you enter
                                into the app is stored locally in your device's browser storage (IndexedDB) and never leaves
                                your device.
                            </p>
                        </section>

                        {/* Data Security */}
                        <section className="space-y-3">
                            <h3 className="text-lg font-semibold">Data Security</h3>
                            <p className="text-sm text-muted-foreground">
                                Since all data is stored locally on your device:
                            </p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                                <li>Your data is as secure as your device</li>
                                <li>We recommend using device lock/password protection</li>
                                <li>Clearing browser data will delete all app data</li>
                                <li>Uninstalling the app will remove all stored information</li>
                            </ul>
                        </section>

                        {/* Data Backup */}
                        <section className="space-y-3">
                            <h3 className="text-lg font-semibold">Data Backup</h3>
                            <p className="text-sm text-muted-foreground">
                                Since we don't store your data on any servers, you are responsible for backing up your data.
                                You can use the "Export Data" feature in the app to create a backup file (JSON or CSV format)
                                that you can save to your preferred location.
                            </p>
                        </section>

                        {/* Third-Party Services */}
                        <section className="space-y-3">
                            <h3 className="text-lg font-semibold">Third-Party Services</h3>
                            <p className="text-sm text-muted-foreground">
                                KharchaPal does not use any third-party services, SDKs, or analytics tools. The app is
                                completely self-contained and offline-capable.
                            </p>
                        </section>

                        {/* Changes to Policy */}
                        <section className="space-y-3">
                            <h3 className="text-lg font-semibold">Changes to This Policy</h3>
                            <p className="text-sm text-muted-foreground">
                                If we ever change our privacy practices, we will update this policy and notify users through
                                the app. However, our core principle of local-only storage will never change.
                            </p>
                        </section>

                        {/* Contact */}
                        <section className="space-y-3">
                            <h3 className="text-lg font-semibold">Contact Us</h3>
                            <p className="text-sm text-muted-foreground">
                                If you have any questions about this Privacy Policy or how KharchaPal handles your data,
                                please contact us at:
                            </p>
                            <a
                                href="mailto:niteshjha.uiux@yahoo.com"
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                niteshjha.uiux@yahoo.com
                            </a>
                        </section>

                        {/* Last Updated */}
                        <section className="pt-4 border-t">
                            <p className="text-xs text-muted-foreground">
                                Last updated: November 24, 2025
                            </p>
                        </section>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
