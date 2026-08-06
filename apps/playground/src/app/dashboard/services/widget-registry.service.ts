import { Injectable } from '@angular/core';
import { WidgetDefinition } from '../models/widget.model';

@Injectable({ providedIn: 'root' })
export class WidgetRegistryService {
  readonly widgets: WidgetDefinition[] = [
    {
      id: 'nutrition',
      label: 'Ausgewogene Ernährung',
      icon: '🥗',
      tag: 'wc-nutrition',
      description: 'Ernährungstipps und persönliches Tracking',
      image: 'assets/images/widgets/nutrition.png',
      category: 'public',
      defaultW: 8, defaultH: 4, minW: 4, minH: 3,
    },
    {
      id: 'my-products',
      label: 'Meine Produkte',
      icon: '🏠',
      tag: 'wc-my-products',
      description: 'Übersicht meiner Versicherungsprodukte',
      image: 'assets/images/widgets/myProducts.png',
      category: 'private',
      defaultW: 2, defaultH: 2, minW: 2, minH: 2,
    },
    {
      id: 'insurance-compare',
      label: 'Grundversicherungen Vergleich',
      icon: '⚖️',
      tag: 'wc-insurance-compare',
      description: 'Alle Grundversicherungsmodelle vergleichen',
      image: 'assets/images/widgets/insurances.png',
      category: 'public',
      defaultW: 6, defaultH: 4, minW: 6, minH: 3,
    },
    {
      id: 'medical-contact',
      label: 'Medizinischer Erstkontakt',
      icon: '🏥',
      tag: 'wc-medical-contact',
      description: 'Hausarzt und Erstkontakt verwalten',
      image: 'assets/images/widgets/initialContact.png',
      category: 'private',
      defaultW: 3, defaultH: 3, minW: 3, minH: 3,
    },
    
   {
      id: 'bank-account',
      label: 'Leistungsverlauf',
      icon: '🏦',
      tag: 'wc-bank-account',
      description: 'Leistungsverlauf einsehen',
      image: 'assets/images/widgets/history.png',
      category: 'private',
      defaultW: 4, defaultH: 2, minW: 3, minH: 2,
    },
    {
      id: 'orders',
      label: 'Aufträge',
      icon: '📋',
      tag: 'wc-orders',
      description: 'Laufende und abgeschlossene Aufträge',
      image: 'assets/images/widgets/orders.png',
      category: 'private',
      defaultW: 4, defaultH: 3, minW: 4, minH: 2,
    },
    {
      id: 'documents',
      label: 'Dokumente',
      icon: '📄',
      tag: 'wc-documents',
      description: 'Dokumente einsehen und herunterladen',
      image: 'assets/images/widgets/documents.png',
      category: 'private',
      defaultW: 4, defaultH: 3, minW: 3, minH: 2,
    },
    {
      id: 'invoices',
      label: 'Rechnungen',
      icon: '🧾',
      tag: 'wc-invoices',
      description: 'Rechnungen einsehen und bezahlen',
      image: 'assets/images/widgets/invoices.png',
      category: 'private',
      defaultW: 6, defaultH: 3, minW: 4, minH: 2,
    },
  ];
}
